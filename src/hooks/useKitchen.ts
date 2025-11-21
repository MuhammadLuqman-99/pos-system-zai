import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';

import {
  orderService,
  orderItemService,
  activityLogService
} from '../lib/supabase';
import { Order, OrderStatus, OrderItem } from '../types';
import { useAuth } from './useAuth';
import { useKitchenRealtime } from './useRealtimeSubscription';
import { getNextOrderStatus, getOrderStatusColor, formatTime } from '../lib/utils';

interface KitchenOrder extends Order {
  order_items: OrderItem[];
  customer?: any;
  table?: any;
}

export const useKitchen = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Enable real-time kitchen updates
  useKitchenRealtime();

  // Get kitchen orders (pending, confirmed, preparing, ready)
  const {
    data: kitchenOrders,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['kitchen-orders', user?.branch_id],
    queryFn: async () => {
      const { data, error } = await orderService.getByBranch(
        user?.branch_id || '',
        undefined // Get all statuses, will filter client-side
      );

      if (error) throw error;

      // Filter for kitchen-relevant statuses and sort by priority
      const kitchenRelevantOrders = data
        ?.filter(order =>
          ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
        ) || [];

      // Sort by status priority and creation time
      return kitchenRelevantOrders.sort((a, b) => {
        const statusPriority = {
          pending: 1,
          confirmed: 2,
          preparing: 3,
          ready: 4,
        };

        const aPriority = statusPriority[a.status] || 999;
        const bPriority = statusPriority[b.status] || 999;

        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        // Same status, sort by creation time
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    },
    enabled: !!user?.branch_id,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  // Get order details for kitchen display
  const getOrderDetails = useCallback(async (orderId: string) => {
    const { data, error } = await orderService.getWithDetails(orderId);
    if (error) {
      toast.error('Failed to load order details');
      return null;
    }
    return data;
  }, []);

  // Update order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
      notes
    }: {
      orderId: string;
      status: OrderStatus;
      notes?: string
    }) => {
      const { data, error } = await orderService.update(orderId, {
        status,
        notes,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Log activity
      await activityLogService.logActivity({
        user_id: user?.id,
        branch_id: user?.branch_id,
        action: 'order_status_updated',
        resource_type: 'order',
        resource_id: orderId,
        details: `Order status updated to ${status}${notes ? ` - ${notes}` : ''}`,
      });

      return data;
    },
    onSuccess: (data, variables) => {
      toast.success(`Order #${data.id.slice(-6)} status updated to ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast.error('Failed to update order status');
      console.error('Update order status error:', error);
    },
  });

  // Update order item status
  const updateOrderItemStatusMutation = useMutation({
    mutationFn: async ({
      itemId,
      status,
      notes
    }: {
      itemId: string;
      status: string;
      notes?: string
    }) => {
      const { data, error } = await orderItemService.updateStatus(itemId, status);

      if (error) throw error;

      // Log activity
      await activityLogService.logActivity({
        user_id: user?.id,
        branch_id: user?.branch_id,
        action: 'order_item_status_updated',
        resource_type: 'order_item',
        resource_id: itemId,
        details: `Order item status updated to ${status}${notes ? ` - ${notes}` : ''}`,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast.error('Failed to update item status');
      console.error('Update order item status error:', error);
    },
  });

  // Start preparation
  const startPreparationMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await orderService.update(orderId, {
        status: 'preparing',
        preparation_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Log activity
      await activityLogService.logActivity({
        user_id: user?.id,
        branch_id: user?.branch_id,
        action: 'preparation_started',
        resource_type: 'order',
        resource_id: orderId,
        details: 'Started preparing order',
      });

      return data;
    },
    onSuccess: (data) => {
      toast.success(`Started preparing order #${data.id.slice(-6)}`);
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
    },
    onError: (error) => {
      toast.error('Failed to start preparation');
      console.error('Start preparation error:', error);
    },
  });

  // Mark order as ready
  const markReadyMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await orderService.update(orderId, {
        status: 'ready',
        ready_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Log activity
      await activityLogService.logActivity({
        user_id: user?.id,
        branch_id: user?.branch_id,
        action: 'order_ready',
        resource_type: 'order',
        resource_id: orderId,
        details: 'Order is ready for serving',
      });

      return data;
    },
    onSuccess: (data) => {
      toast.success(`Order #${data.id.slice(-6)} is ready for serving!`);
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (error) => {
      toast.error('Failed to mark order as ready');
      console.error('Mark ready error:', error);
    },
  });

  // Group orders by status
  const getOrdersByStatus = useCallback(() => {
    const grouped = {
      pending: [] as KitchenOrder[],
      confirmed: [] as KitchenOrder[],
      preparing: [] as KitchenOrder[],
      ready: [] as KitchenOrder[],
    };

    kitchenOrders?.forEach(order => {
      if (order.status in grouped) {
        grouped[order.status as keyof typeof grouped].push(order);
      }
    });

    return grouped;
  }, [kitchenOrders]);

  // Get order urgency
  const getOrderUrgency = useCallback((order: KitchenOrder) => {
    const now = new Date();
    const orderTime = new Date(order.created_at);
    const minutesElapsed = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));

    if (order.status === 'ready') return 'high';
    if (order.status === 'preparing' && minutesElapsed > 20) return 'high';
    if (order.status === 'confirmed' && minutesElapsed > 10) return 'medium';
    if (order.status === 'pending' && minutesElapsed > 5) return 'high';

    return 'low';
  }, []);

  // Get urgency color
  const getUrgencyColor = useCallback((urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-white';
    }
  }, []);

  // Calculate preparation time
  const getPreparationTime = useCallback((order: KitchenOrder) => {
    if (order.order.status === 'pending') return null;

    const startTime = order.order.updated_at || order.order.created_at;
    const now = new Date();
    const start = new Date(startTime);

    const minutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));

    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }, []);

  // Get order summary
  const getOrderSummary = useCallback((order: KitchenOrder) => {
    const items = order.order_items || [];
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const totalItems = items.length;

    return {
      itemCount,
      totalItems,
      subtotal: items.reduce((total, item) => total + item.subtotal, 0),
    };
  }, []);

  // Check if all items in an order are ready
  const areAllItemsReady = useCallback((order: KitchenOrder) => {
    const items = order.order_items || [];
    return items.length > 0 && items.every(item => item.status === 'ready');
  }, []);

  // Auto-mark order as ready when all items are ready
  useEffect(() => {
    kitchenOrders?.forEach(order => {
      if (order.status === 'preparing' && areAllItemsReady(order)) {
        markReadyMutation.mutate(order.id);
      }
    });
  }, [kitchenOrders, areAllItemsReady, markReadyMutation]);

  // Note: Sound notifications are now handled by the real-time subscription hook
  // This effect is removed to avoid duplicate notifications

  return {
    // Data
    kitchenOrders: kitchenOrders || [],
    isLoading,
    error,

    // Actions
    refetch,
    getOrderDetails,
    updateOrderStatus: updateOrderStatusMutation.mutate,
    updateOrderItemStatus: updateOrderItemStatusMutation.mutate,
    startPreparation: startPreparationMutation.mutate,
    markReady: markReadyMutation.mutate,

    // Helpers
    getOrdersByStatus,
    getOrderUrgency,
    getUrgencyColor,
    getPreparationTime,
    getOrderSummary,
    areAllItemsReady,
    getNextOrderStatus,
    getOrderStatusColor,
    formatTime,

    // Loading states
    isUpdatingStatus: updateOrderStatusMutation.isLoading,
    isUpdatingItemStatus: updateOrderItemStatusMutation.isLoading,
    isStartingPreparation: startPreparationMutation.isLoading,
    isMarkingReady: markReadyMutation.isLoading,
  };
};