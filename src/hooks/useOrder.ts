import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';

import { orderService, orderItemService, paymentService, activityLogService } from '../lib/supabase';
import { Order, OrderItem, OrderStatus, Payment, Customer, Product } from '../types';
import { useAuth } from './useAuth';
import { useOrderRealtime } from './useRealtimeSubscription';
import { formatCurrency } from '../lib/utils';

interface CreateOrderData {
  customer_id?: string;
  table_id?: string;
  branch_id: string;
  staff_id: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery';
}

interface UpdateOrderData {
  status?: OrderStatus;
  notes?: string;
}

export const useOrder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Enable real-time order updates
  useOrderRealtime();

  // Get orders for current branch
  const {
    data: orders,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['orders', user?.branch_id],
    queryFn: () => orderService.getByBranch(user?.branch_id || ''),
    enabled: !!user?.branch_id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get order details
  const getOrderDetails = useCallback(async (orderId: string) => {
    const { data, error } = await orderService.getWithDetails(orderId);
    if (error) {
      toast.error('Failed to load order details');
      return null;
    }
    return data;
  }, []);

  // Create new order
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      // Create the order
      const { data: order, error: orderError } = await orderService.create({
        ...orderData,
        status: 'pending',
        subtotal: 0,
        tax: 0,
        total: 0,
        created_at: new Date().toISOString(),
      });

      if (orderError) throw orderError;

      // Log activity
      await activityLogService.logActivity({
        user_id: orderData.staff_id,
        branch_id: orderData.branch_id,
        action: 'order_created',
        resource_type: 'order',
        resource_id: order.id,
        details: `Created new order #${order.id.slice(-6)}`,
      });

      return order;
    },
    onSuccess: () => {
      toast.success('Order created successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (error) => {
      toast.error('Failed to create order');
      console.error('Create order error:', error);
    },
  });

  // Update order
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: string; updates: UpdateOrderData }) => {
      const { data, error } = await orderService.update(orderId, {
        ...updates,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Log status change
      if (updates.status) {
        await activityLogService.logActivity({
          user_id: user?.id,
          branch_id: user?.branch_id,
          action: 'order_status_updated',
          resource_type: 'order',
          resource_id: orderId,
          details: `Order status changed to ${updates.status}`,
        });
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Order updated successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast.error('Failed to update order');
      console.error('Update order error:', error);
    },
  });

  // Add items to order
  const addOrderItemMutation = useMutation({
    mutationFn: async ({
      orderId,
      product,
      quantity,
      notes,
      modifiers,
    }: {
      orderId: string;
      product: Product;
      quantity: number;
      notes?: string;
      modifiers?: any[];
    }) => {
      const { data, error } = await orderItemService.create({
        order_id: orderId,
        product_id: product.id,
        quantity,
        unit_price: product.price,
        subtotal: product.price * quantity,
        notes,
        modifiers: modifiers || [],
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Log activity
      await activityLogService.logActivity({
        user_id: user?.id,
        branch_id: user?.branch_id,
        action: 'order_item_added',
        resource_type: 'order_item',
        resource_id: data.id,
        details: `Added ${quantity}x ${product.name} to order`,
      });

      return data;
    },
    onSuccess: () => {
      toast.success('Item added to order');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast.error('Failed to add item to order');
      console.error('Add order item error:', error);
    },
  });

  // Update order item
  const updateOrderItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      updates,
    }: {
      itemId: string;
      updates: Partial<OrderItem>;
    }) => {
      const { data, error } = await orderItemService.update(itemId, {
        ...updates,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Order item updated');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast.error('Failed to update order item');
      console.error('Update order item error:', error);
    },
  });

  // Remove order item
  const removeOrderItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await orderItemService.delete(itemId);
      if (error) throw error;

      // Log activity
      await activityLogService.logActivity({
        user_id: user?.id,
        branch_id: user?.branch_id,
        action: 'order_item_removed',
        resource_type: 'order_item',
        resource_id: itemId,
        details: 'Removed item from order',
      });

      return true;
    },
    onSuccess: () => {
      toast.success('Item removed from order');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast.error('Failed to remove item from order');
      console.error('Remove order item error:', error);
    },
  });

  // Cancel order
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await orderService.update(orderId, {
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Log activity
      await activityLogService.logActivity({
        user_id: user?.id,
        branch_id: user?.branch_id,
        action: 'order_cancelled',
        resource_type: 'order',
        resource_id: orderId,
        details: 'Order cancelled',
      });

      return data;
    },
    onSuccess: () => {
      toast.success('Order cancelled');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (error) => {
      toast.error('Failed to cancel order');
      console.error('Cancel order error:', error);
    },
  });

  // Get orders by status
  const getOrdersByStatus = useCallback((status: OrderStatus) => {
    return orders?.filter(order => order.status === status) || [];
  }, [orders]);

  // Get today's orders
  const getTodayOrders = useCallback(() => {
    const today = new Date().toDateString();
    return orders?.filter(order =>
      new Date(order.created_at).toDateString() === today
    ) || [];
  }, [orders]);

  // Calculate order totals
  const calculateOrderTotals = useCallback((order: Order & { order_items?: OrderItem[] }) => {
    const items = order.order_items || [];
    const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
    };
  }, []);

  return {
    // Data
    orders,
    isLoading,
    error,

    // Actions
    refetch,
    getOrderDetails,
    createOrder: createOrderMutation.mutate,
    updateOrder: updateOrderMutation.mutate,
    addOrderItem: addOrderItemMutation.mutate,
    updateOrderItem: updateOrderItemMutation.mutate,
    removeOrderItem: removeOrderItemMutation.mutate,
    cancelOrder: cancelOrderMutation.mutate,

    // Helpers
    getOrdersByStatus,
    getTodayOrders,
    calculateOrderTotals,

    // Loading states
    isCreating: createOrderMutation.isLoading,
    isUpdating: updateOrderMutation.isLoading,
    isAddingItem: addOrderItemMutation.isLoading,
    isUpdatingItem: updateOrderItemMutation.isLoading,
    isRemovingItem: removeOrderItemMutation.isLoading,
    isCancelling: cancelOrderMutation.isLoading,
  };
};