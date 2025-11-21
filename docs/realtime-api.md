# Real-time API Documentation

## Overview

The Restaurant POS System includes comprehensive real-time functionality using Supabase's WebSocket subscriptions. This enables live updates across all connected devices, ensuring staff coordination and instant order status updates.

## Real-time Architecture

### WebSocket Connection Management

The system uses Supabase's real-time subscriptions to monitor database changes and broadcast updates to all connected clients.

```typescript
// Core real-time hook
useRealtimeSubscription({
  tables: ['orders', 'order_items', 'payments'],
  schema: 'public',
  filter: `branch_id=eq.${user?.branch_id}`,
  callback: (payload) => handleRealtimeEvent(payload)
});
```

### Connection Status

The system provides real-time connection status monitoring:

- **Connected**: Green indicator - WebSocket connection active
- **Disconnected**: Red indicator with pulse animation
- **Reconnecting**: Blue spinning indicator during reconnection attempts

## Real-time Features

### 1. Order Management

#### New Order Notifications
```typescript
// Automatic new order detection
{
  event: 'INSERT',
  table: 'orders',
  new: {
    id: 'abc123',
    status: 'pending',
    branch_id: 'branch_001',
    customer_id: 'customer_123',
    total: 45.99
  }
}

// Response: Audio notification + Toast message
toast('🔔 New order #abc123 received');
audio.play('/sounds/notification.mp3');
```

#### Order Status Updates
```typescript
// Order status change detection
{
  event: 'UPDATE',
  table: 'orders',
  old: { status: 'pending' },
  new: { status: 'confirmed' }
}

// Response: Context-aware notification
toast('✅ Order #abc123 confirmed');
```

### 2. Kitchen Display System

#### Real-time Kitchen Updates
```typescript
// Kitchen-specific subscription
useKitchenRealtime(); // Auto-enables: orders, order_items

// Item ready notification
{
  event: 'UPDATE',
  table: 'order_items',
  new: {
    id: 'item_123',
    order_id: 'order_456',
    status: 'ready',
    product_name: 'Burger'
  }
}

// Response: Kitchen notification + audio
toast('🍽️ Burger ready for order #456');
audio.play('/sounds/kitchen-ready.mp3');
```

#### Automatic Order Completion
```typescript
// Auto-mark orders as ready when all items are ready
useEffect(() => {
  const allItemsReady = areAllItemsReady(order);
  if (order.status === 'preparing' && allItemsReady) {
    markReady(order.id);
  }
}, [order.order_items]);
```

### 3. Table Management

#### Table Status Updates
```typescript
// Table status change detection
{
  event: 'UPDATE',
  table: 'restaurant_tables',
  new: {
    id: 'table_001',
    table_no: 'T5',
    status: 'occupied'
  }
}

// Response: Table status notification
toast('👥 Table T5 occupied');
```

### 4. Payment Processing

#### Payment Status Updates
```typescript
// Payment completion detection
{
  event: 'INSERT',
  table: 'payments',
  new: {
    id: 'payment_123',
    order_id: 'order_456',
    amount: 45.99,
    status: 'completed',
    method: 'card'
  }
}

// Response: Payment notification
toast.success('💳 Payment received: $45.99');
```

#### Payment Failure Handling
```typescript
{
  event: 'UPDATE',
  table: 'payments',
  old: { status: 'pending' },
  new: { status: 'failed' }
}

// Response: Error notification
toast.error('❌ Payment failed: $45.99');
```

### 5. Inventory Management

#### Low Stock Alerts
```typescript
// Stock movement detection
{
  event: 'INSERT',
  table: 'stock_movements',
  new: {
    product_id: 'prod_123',
    adjustment_type: 'sale',
    quantity: -1,
    current_stock: 0,
    product_name: 'Tomatoes'
  }
}

// Response: Low stock warning
toast.error('🚨 Tomatoes is now OUT OF STOCK!', { duration: 10000 });
```

## Real-time Hooks

### useRealtimeSubscription

Generic hook for subscribing to database changes.

```typescript
const { channelRef } = useRealtimeSubscription({
  tables: ['orders', 'payments'],      // Tables to monitor
  schema: 'public',                    // Database schema
  filter: `branch_id=eq.${branchId}`, // Row filter
  callback: (payload) => {            // Event handler
    console.log('Real-time event:', payload);
  }
});
```

**Parameters:**
- `tables`: Array of table names to monitor
- `schema`: Database schema (default: 'public')
- `filter`: PostgreSQL WHERE clause for row filtering
- `callback`: Function to handle real-time events

### Specialized Hooks

#### useOrderRealtime
```typescript
// Auto-subscribes to orders and order_items
useOrderRealtime();

// Features:
// - New order audio notifications
// - Order status change notifications
// - Auto-query invalidation
```

#### useKitchenRealtime
```typescript
// Kitchen-specific real-time updates
useKitchenRealtime();

// Features:
// - Item ready notifications
// - Order preparation tracking
// - Kitchen audio alerts
```

#### useTableRealtime
```typescript
// Table status monitoring
useTableRealtime();

// Features:
// - Table occupation updates
// - Status change notifications
// - Multi-device sync
```

#### useInventoryRealtime
```typescript
// Stock level monitoring
useInventoryRealtime();

// Features:
// - Low stock warnings
// - Out-of-stock alerts
// - Critical inventory notifications
```

#### usePaymentRealtime
```typescript
// Payment status monitoring
usePaymentRealtime();

// Features:
// - Payment completion notifications
// - Payment failure alerts
// - Transaction status updates
```

## Real-time Events

### Event Payload Structure

```typescript
interface RealtimeEvent {
  table: string;           // Table name (orders, payments, etc.)
  schema: string;          // Database schema
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: any;               // New record data
  old?: any;              // Previous record data (for UPDATE/DELETE)
  timestamp: string;      // Event timestamp
}
```

### Event Types

#### INSERT Events
```typescript
{
  eventType: 'INSERT',
  table: 'orders',
  new: {
    id: 'order_123',
    status: 'pending',
    customer_id: 'cust_456',
    total: 25.99,
    created_at: '2024-01-01T12:00:00Z'
  }
}
```

#### UPDATE Events
```typescript
{
  eventType: 'UPDATE',
  table: 'orders',
  old: { status: 'pending' },
  new: {
    id: 'order_123',
    status: 'confirmed',
    updated_at: '2024-01-01T12:01:00Z'
  }
}
```

#### DELETE Events
```typescript
{
  eventType: 'DELETE',
  table: 'order_items',
  old: {
    id: 'item_789',
    order_id: 'order_123',
    product_id: 'prod_456'
  }
}
```

## Audio Notifications

### Supported Audio Files

Place these files in `/public/sounds/`:

- `notification.mp3` - New order notifications
- `kitchen-ready.mp3` - Kitchen item ready alerts
- `payment-success.mp3` - Successful payment notifications
- `payment-failed.mp3` - Failed payment alerts
- `low-stock.mp3` - Low stock warnings
- `table-changed.mp3` - Table status changes

### Audio Configuration

```typescript
// Audio playback with error handling
try {
  const audio = new Audio('/sounds/notification.mp3');
  audio.play().catch(error => {
    console.log('Audio autoplay blocked:', error);
  });
} catch (error) {
  console.log('Audio not supported:', error);
}
```

### Browser Autoplay Policies

Most browsers require user interaction before playing audio. The system includes fallback handling:

- **Auto-play blocked**: Silent fallback with visual notifications
- **User interaction required**: First click enables audio
- **Mobile devices**: Touch gesture required for audio

## Connection Management

### RealtimeProvider Component

Centralizes all real-time subscriptions:

```tsx
import { RealtimeProvider } from './components/RealtimeProvider';

function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
        {/* Your app content */}
      </RealtimeProvider>
    </AuthProvider>
  );
}
```

### RealtimeStatus Component

Displays connection status and reconnection controls:

```tsx
// Show connection status only
<RealtimeStatus />

// Show with text details
<RealtimeStatus showText={true} />

// Custom styling
<RealtimeStatus className="absolute top-4 right-4" />
```

### Manual Reconnection

Users can manually reconnect if connection is lost:

```typescript
const handleReconnect = async () => {
  const channel = supabase.channel('reconnect-test');
  await channel.subscribe();
  // Check connection status
};
```

## Performance Optimization

### Efficient Subscriptions

```typescript
// Good: Subscribe to specific tables only
useRealtimeSubscription({
  tables: ['orders'], // Specific tables
  filter: `branch_id=eq.${user.branch_id}` // Row filtering
});

// Avoid: Subscribe to all tables
useRealtimeSubscription({
  tables: ['*'] // Not recommended
});
```

### Query Invalidation Strategy

```typescript
// Automatic query invalidation
queryClient.invalidateQueries({ queryKey: ['orders'] });

// Selective invalidation
queryClient.invalidateQueries({
  queryKey: ['orders', orderId]
});
```

### Connection Cleanup

```typescript
useEffect(() => {
  // Setup subscriptions
  const channels = setupRealtimeSubscriptions();

  // Cleanup on unmount
  return () => {
    channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
  };
}, []);
```

## Error Handling

### Connection Errors

```typescript
channel.subscribe((status) => {
  switch (status) {
    case 'SUBSCRIBED':
      console.log('Connected to real-time updates');
      break;
    case 'CHANNEL_ERROR':
      console.error('Real-time connection failed');
      toast.error('Real-time updates unavailable');
      break;
    case 'TIMED_OUT':
      console.error('Real-time connection timeout');
      break;
  }
});
```

### Event Processing Errors

```typescript
try {
  const payload = JSON.parse(eventData);
  handleRealtimeEvent(payload);
} catch (error) {
  console.error('Error processing real-time event:', error);
  // Fallback handling
}
```

## Security Considerations

### Row Level Security (RLS)

All real-time subscriptions respect RLS policies:

```sql
-- Only users can see their branch data
CREATE POLICY "Users can view branch orders" ON orders
  FOR SELECT USING (branch_id = auth.jwt() ->> 'branch_id');
```

### Data Filtering

```typescript
// Filter by user's branch
const filter = `branch_id=eq.${user.branch_id}`;

// Filter by role-based access
const roleFilter = user.role === 'admin' ? '' : `created_by=eq.${user.id}`;
```

### Sensitive Data

Avoid broadcasting sensitive information in real-time events:

```typescript
// Good: Public order status
{ status: 'ready', table_no: 'T5' }

// Avoid: Sensitive customer data
{ credit_card: '****-****-****-1234' }
```

## Testing Real-time Features

### Manual Testing

1. **Multiple Browser Tabs**: Open the app in multiple tabs to simulate multiple users
2. **Order Creation**: Create orders in one tab and verify updates in others
3. **Status Changes**: Update order status and verify notifications
4. **Connection Testing**: Disconnect network and verify reconnection

### Automated Testing

```typescript
// Mock real-time events for testing
const mockRealtimeEvent = {
  eventType: 'INSERT',
  table: 'orders',
  new: mockOrderData
};

// Test event handling
expect(handleRealtimeEvent(mockRealtimeEvent)).toHaveBeenCalled();
```

## Troubleshooting

### Common Issues

#### No Real-time Updates
1. Check WebSocket connection status
2. Verify RLS policies allow access
3. Check network connectivity
4. Verify Supabase project settings

#### Audio Not Playing
1. Browser requires user interaction
2. Audio files missing from `/sounds/`
3. Volume muted in browser
4. Audio format not supported

#### Connection Drops
1. Network instability
2. Server timeouts
3. Browser tab in background
4. WebSocket connection limits

### Debug Mode

Enable debug logging:

```typescript
// Enable Supabase debug logging
supabase.realtime.setAuth('your-token');

// Log all events
channel.on('postgres_changes', (payload) => {
  console.log('Real-time event:', payload);
});
```

## Future Enhancements

### Planned Features

- **Push Notifications**: Mobile push notifications
- **Offline Sync**: Background sync when reconnected
- **Multi-tenant Events**: Cross-branch event broadcasting
- **Performance Metrics**: Real-time performance monitoring
- **Event Replays**: Missed event replay functionality

### Scalability Considerations

- **Connection Pooling**: Efficient connection management
- **Event Throttling**: Prevent event flooding
- **Load Balancing**: Distribute WebSocket connections
- **Caching Strategy**: Smart event caching

---

**Last Updated**: January 2024
**Version**: 1.0.0