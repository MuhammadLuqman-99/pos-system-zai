import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';

import {
  productService,
  stockService,
  activityLogService
} from '../lib/supabase';
import { Product, StockMovement } from '../types';
import { useAuth } from './useAuth';
import { useInventoryRealtime } from './useRealtimeSubscription';
import { getStockStatus, getStockStatusColor, formatCurrency } from '../lib/utils';

interface StockAdjustmentData {
  product_id: string;
  branch_id: string;
  adjustment_type: 'increase' | 'decrease' | 'sale' | 'waste' | 'return' | 'transfer_in' | 'transfer_out';
  quantity: number;
  reason: string;
  reference_id?: string;
  notes?: string;
}

export const useInventory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Enable real-time inventory updates
  useInventoryRealtime();

  // Get all products with current stock levels
  const {
    data: products,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['inventory-products', user?.branch_id],
    queryFn: async () => {
      const { data, error } = await productService.getByBranch(user?.branch_id || '');
      if (error) throw error;

      // Get stock levels for each product
      const productsWithStock = await Promise.all(
        data.map(async (product) => {
          const { data: stockMovements } = await stockService.getByProduct(
            product.id,
            user?.branch_id
          );

          const currentStock = stockMovements?.reduce((total, movement) => {
            switch (movement.adjustment_type) {
              case 'increase':
              case 'transfer_in':
              case 'return':
                return total + movement.quantity;
              case 'decrease':
              case 'sale':
              case 'waste':
              case 'transfer_out':
                return total - movement.quantity;
              default:
                return total;
            }
          }, 0) || 0;

          const stockStatus = getStockStatus(currentStock, product.min_stock_level);

          return {
            ...product,
            current_stock: currentStock,
            stock_status: stockStatus,
            stock_value: currentStock * product.cost_price,
          };
        })
      );

      return productsWithStock;
    },
    enabled: !!user?.branch_id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get low stock products
  const {
    data: lowStockProducts,
    isLoading: isLoadingLowStock,
  } = useQuery({
    queryKey: ['low-stock-products', user?.branch_id],
    queryFn: () => stockService.getLowStock(user?.branch_id || ''),
    enabled: !!user?.branch_id,
    refetchInterval: 60000, // Refetch every minute
  });

  // Get stock movements for a specific product
  const getProductStockHistory = useCallback(async (productId: string) => {
    const { data, error } = await stockService.getByProduct(productId, user?.branch_id);
    if (error) {
      toast.error('Failed to load stock history');
      return [];
    }
    return data || [];
  }, [user?.branch_id]);

  // Adjust stock levels
  const adjustStockMutation = useMutation({
    mutationFn: async (adjustmentData: StockAdjustmentData) => {
      // Create stock movement record
      const { data: movement, error } = await stockService.adjustStock({
        ...adjustmentData,
        staff_id: user?.id,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Log activity
      await activityLogService.logActivity({
        user_id: user?.id,
        branch_id: user?.branch_id,
        action: 'stock_adjusted',
        resource_type: 'product',
        resource_id: adjustmentData.product_id,
        details: `Stock ${adjustmentData.adjustment_type}: ${adjustmentData.quantity} units - ${adjustmentData.reason}`,
      });

      return movement;
    },
    onSuccess: (data, variables) => {
      const action = variables.adjustment_type === 'increase' ? 'added' : 'removed';
      toast.success(`Successfully ${action} ${variables.quantity} units to inventory`);
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });
    },
    onError: (error) => {
      toast.error('Failed to adjust stock');
      console.error('Stock adjustment error:', error);
    },
  });

  // Bulk stock adjustment
  const bulkAdjustStockMutation = useMutation({
    mutationFn: async (adjustments: StockAdjustmentData[]) => {
      const results = await Promise.all(
        adjustments.map(async (adjustment) => {
          const { data, error } = await stockService.adjustStock({
            ...adjustment,
            staff_id: user?.id,
            created_at: new Date().toISOString(),
          });

          if (error) throw error;
          return data;
        })
      );

      // Log bulk activity
      await activityLogService.logActivity({
        user_id: user?.id,
        branch_id: user?.branch_id,
        action: 'bulk_stock_adjustment',
        resource_type: 'inventory',
        details: `Bulk stock adjustment: ${adjustments.length} products updated`,
      });

      return results;
    },
    onSuccess: (data, variables) => {
      toast.success(`Successfully adjusted stock for ${variables.length} products`);
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });
    },
    onError: (error) => {
      toast.error('Failed to perform bulk stock adjustment');
      console.error('Bulk stock adjustment error:', error);
    },
  });

  // Get stock movement history for all products
  const getStockHistory = useCallback(async (filters?: {
    product_id?: string;
    adjustment_type?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    // This would typically be a database function or more complex query
    // For now, we'll use a basic approach
    const { data, error } = await stockService.getAll(filters);
    if (error) {
      toast.error('Failed to load stock history');
      return [];
    }

    // Filter by branch and sort by date
    return data
      ?.filter(movement => movement.branch_id === user?.branch_id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      || [];
  }, [user?.branch_id]);

  // Calculate inventory value
  const calculateInventoryValue = useCallback(() => {
    if (!products) return 0;

    return products.reduce((total, product) => {
      return total + (product.current_stock * product.cost_price);
    }, 0);
  }, [products]);

  // Get inventory summary
  const getInventorySummary = useCallback(() => {
    if (!products) return {
      totalProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      totalValue: 0,
      totalStock: 0,
    };

    const summary = {
      totalProducts: products.length,
      lowStockProducts: products.filter(p => p.stock_status === 'low').length,
      outOfStockProducts: products.filter(p => p.stock_status === 'out').length,
      totalValue: products.reduce((sum, p) => sum + p.stock_value, 0),
      totalStock: products.reduce((sum, p) => sum + p.current_stock, 0),
    };

    return summary;
  }, [products]);

  // Get products by stock status
  const getProductsByStockStatus = useCallback((status: 'low' | 'out' | 'normal') => {
    if (!products) return [];
    return products.filter(product => product.stock_status === status);
  }, [products]);

  // Search products
  const searchProducts = useCallback((query: string) => {
    if (!products || !query) return [];

    const lowerQuery = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.sku.toLowerCase().includes(lowerQuery) ||
      product.barcode.toLowerCase().includes(lowerQuery)
    );
  }, [products]);

  // Validate stock adjustment
  const validateStockAdjustment = useCallback((adjustment: StockAdjustmentData) => {
    const errors: string[] = [];

    if (!adjustment.product_id) {
      errors.push('Product is required');
    }

    if (!adjustment.adjustment_type) {
      errors.push('Adjustment type is required');
    }

    if (!adjustment.quantity || adjustment.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (!adjustment.reason) {
      errors.push('Reason is required');
    }

    // For decreases, check if enough stock is available
    if (['decrease', 'sale', 'waste', 'transfer_out'].includes(adjustment.adjustment_type)) {
      const product = products?.find(p => p.id === adjustment.product_id);
      if (product && product.current_stock < adjustment.quantity) {
        errors.push(`Insufficient stock. Available: ${product.current_stock}, Requested: ${adjustment.quantity}`);
      }
    }

    return errors;
  }, [products]);

  // Generate stock report
  const generateStockReport = useCallback(async (format: 'json' | 'csv' = 'json') => {
    if (!products) return null;

    const reportData = products.map(product => ({
      sku: product.sku,
      name: product.name,
      category: product.category?.name || 'N/A',
      current_stock: product.current_stock,
      min_stock_level: product.min_stock_level,
      stock_status: product.stock_status,
      unit_price: product.price,
      cost_price: product.cost_price,
      stock_value: product.stock_value,
      last_updated: new Date().toISOString(),
    }));

    if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(reportData[0]).join(',');
      const rows = reportData.map(row => Object.values(row).join(','));
      return [headers, ...rows].join('\n');
    }

    return reportData;
  }, [products]);

  return {
    // Data
    products: products || [],
    lowStockProducts: lowStockProducts || [],
    isLoading,
    isLoadingLowStock,
    error,

    // Actions
    refetch,
    getProductStockHistory,
    adjustStock: adjustStockMutation.mutate,
    bulkAdjustStock: bulkAdjustStockMutation.mutate,
    getStockHistory,
    searchProducts,
    generateStockReport,

    // Helpers
    calculateInventoryValue,
    getInventorySummary,
    getProductsByStockStatus,
    validateStockAdjustment,
    getStockStatus,
    getStockStatusColor,
    formatCurrency,

    // Loading states
    isAdjusting: adjustStockMutation.isLoading,
    isBulkAdjusting: bulkAdjustStockMutation.isLoading,
  };
};