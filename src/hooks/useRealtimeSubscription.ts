import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';

type RealtimeEvent = {
  table: string;
  schema: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: any;
  old: any;
};

type RealtimeCallback = (payload: RealtimeEvent) => void;

interface UseRealtimeSubscriptionOptions {
  tables?: string[];
  schema?: string;
  filter?: string;
  callback?: RealtimeCallback;
}

export const useRealtimeSubscription = ({
  tables = [],
  schema = 'public',
  filter,
  callback
}: UseRealtimeSubscriptionOptions) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  const subscribeToTable = useCallback((table: string) => {
    const channelName = `${schema}_${table}_${user?.branch_id}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema,
          table,
          filter: filter ? `${filter}` : undefined
        },
        (payload: RealtimeEvent) => {
          console.log('Realtime event:', payload);

          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: [table] });
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
          queryClient.invalidateQueries({ queryKey: ['tables'] });

          // Call custom callback if provided
          if (callback) {
            callback(payload);
          }

          // Show notifications for specific events
          handleRealtimeNotifications(payload);
        }
      );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to ${table} changes`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Failed to subscribe to ${table}`);
        toast.error('Real-time connection failed');
      }
    });

    return channel;
  }, [schema, filter, callback, queryClient, user?.branch_id]);

  useEffect(() => {
    if (!user?.branch_id || tables.length === 0) return;

    // Subscribe to all specified tables
    const channels = tables.map(table => subscribeToTable(table));
    channelRef.current = channels;

    return () => {
      // Unsubscribe from all channels
      channels.forEach(channel => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
    };
  }, [user?.branch_id, tables, subscribeToTable]);

  return { channelRef };
};

// Handle real-time notifications
const handleRealtimeNotifications = (payload: RealtimeEvent) => {
  const { eventType, table, new: newRecord, old: oldRecord } = payload;

  switch (table) {
    case 'orders':
      handleOrderNotifications(eventType, newRecord, oldRecord);
      break;
    case 'order_items':
      handleOrderItemNotifications(eventType, newRecord);
      break;
    case 'payments':
      handlePaymentNotifications(eventType, newRecord);
      break;
    case 'restaurant_tables':
      handleTableNotifications(eventType, newRecord);
      break;
    case 'stock_movements':
      handleStockNotifications(eventType, newRecord);
      break;
    default:
      break;
  }
};

const handleOrderNotifications = (eventType: string, newOrder: any, oldOrder?: any) => {
  const orderId = newOrder?.id?.slice(-6) || 'N/A';

  switch (eventType) {
    case 'INSERT':
      if (newOrder.status === 'pending') {
        toast(`🔔 New order #${orderId} received`, {
          icon: '📝',
          duration: 5000,
        });
      }
      break;
    case 'UPDATE':
      const statusChanged = oldOrder?.status !== newOrder?.status;
      if (statusChanged) {
        const statusMessages = {
          confirmed: '✅ Order confirmed',
          preparing: '👨‍🍳 Order started preparing',
          ready: '🔔 Order ready for serving',
          served: '🍽️ Order served',
          completed: '✨ Order completed',
          cancelled: '❌ Order cancelled',
        };

        const message = statusMessages[newOrder?.status];
        if (message) {
          toast(`${message} #${orderId}`, {
            icon: '📋',
            duration: 4000,
          });
        }
      }
      break;
  }
};

const handleOrderItemNotifications = (eventType: string, orderItem: any) => {
  if (eventType === 'UPDATE' && orderItem.status === 'ready') {
    toast(`🍽️ Item ready: ${orderItem.product?.name || 'Item'}`, {
      icon: '✅',
      duration: 3000,
    });
  }
};

const handlePaymentNotifications = (eventType: string, payment: any) => {
  if (eventType === 'INSERT') {
    if (payment.status === 'completed') {
      toast.success(`💳 Payment received: $${payment.amount.toFixed(2)}`);
    } else if (payment.status === 'failed') {
      toast.error(`❌ Payment failed: $${payment.amount.toFixed(2)}`);
    }
  }
};

const handleTableNotifications = (eventType: string, table: any) => {
  if (eventType === 'UPDATE') {
    const tableNumber = table.table_no;
    const statusMessages = {
      occupied: '👥 Table occupied',
      available: '✅ Table available',
      reserved: '📅 Table reserved',
      cleaning: '🧹 Table cleaning',
    };

    const message = statusMessages[table.status];
    if (message) {
      toast(`${message} #${tableNumber}`, {
        icon: '🪑',
        duration: 3000,
      });
    }
  }
};

const handleStockNotifications = (eventType: string, stockMovement: any) => {
  if (eventType === 'INSERT' && stockMovement.adjustment_type === 'sale') {
    const productName = stockMovement.product?.name || 'Product';

    // Check if it's a low stock warning
    if (stockMovement.quantity <= 0) {
      toast.warning(`⚠️ ${productName} is out of stock!`, {
        duration: 6000,
      });
    }
  }
};

// Specialized hooks for different real-time needs

export const useOrderRealtime = () => {
  const callback = useCallback((payload: RealtimeEvent) => {
    if (payload.table === 'orders') {
      // Custom order-specific logic
      const { eventType, new: newOrder } = payload;

      if (eventType === 'INSERT') {
        // Play sound for new orders
        try {
          const audio = new Audio('/sounds/notification.mp3');
          audio.play().catch(() => {
            // Ignore autoplay errors
          });
        } catch (error) {
          // Ignore audio errors
        }
      }
    }
  }, []);

  return useRealtimeSubscription({
    tables: ['orders', 'order_items'],
    callback,
  });
};

export const useKitchenRealtime = () => {
  const callback = useCallback((payload: RealtimeEvent) => {
    if (payload.table === 'orders' || payload.table === 'order_items') {
      const { eventType, new: record } = payload;

      if (eventType === 'UPDATE') {
        // Handle kitchen-specific updates
        if (payload.table === 'order_items' && record.status === 'ready') {
          // Notify kitchen staff
          try {
            const audio = new Audio('/sounds/kitchen-ready.mp3');
            audio.play().catch(() => {
              // Ignore autoplay errors
            });
          } catch (error) {
            // Ignore audio errors
          }
        }
      }
    }
  }, []);

  return useRealtimeSubscription({
    tables: ['orders', 'order_items'],
    callback,
  });
};

export const useTableRealtime = () => {
  return useRealtimeSubscription({
    tables: ['restaurant_tables', 'table_orders', 'orders'],
  });
};

export const useInventoryRealtime = () => {
  const callback = useCallback((payload: RealtimeEvent) => {
    if (payload.table === 'stock_movements') {
      const { new: movement } = payload;

      // Check for low stock alerts
      if (movement.adjustment_type === 'sale' && movement.quantity <= 0) {
        // Show critical low stock warning
        toast.error(`🚨 ${movement.product?.name} is now OUT OF STOCK!`, {
          duration: 10000,
          icon: '⚠️',
        });
      }
    }
  }, []);

  return useRealtimeSubscription({
    tables: ['stock_movements', 'products'],
    callback,
  });
};

export const usePaymentRealtime = () => {
  return useRealtimeSubscription({
    tables: ['payments'],
  });
};

// Utility to manually trigger real-time refresh
export const useRealtimeRefresh = () => {
  const queryClient = useQueryClient();

  const refreshOrders = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
  }, [queryClient]);

  const refreshTables = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tables'] });
  }, [queryClient]);

  const refreshInventory = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
    queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });
  }, [queryClient]);

  const refreshAll = useCallback(() => {
    refreshOrders();
    refreshTables();
    refreshInventory();
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }, [refreshOrders, refreshTables, refreshInventory, queryClient]);

  return {
    refreshOrders,
    refreshTables,
    refreshInventory,
    refreshAll,
  };
};