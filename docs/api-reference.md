# 📚 API Reference

Complete API documentation for the Restaurant POS System.

## Table of Contents

- [Authentication](#authentication)
- [Branches](#branches)
- [Users](#users)
- [Categories](#categories)
- [Products](#products)
- [Restaurant Tables](#restaurant-tables)
- [Customers](#customers)
- [Orders](#orders)
- [Order Items](#order-items)
- [Payments](#payments)
- [Stock Movements](#stock-movements)
- [Loyalty Programs](#loyalty-programs)
- [Table Orders](#table-orders)
- [Activity Logs](#activity-logs)
- [Reports](#reports)
- [Real-time Subscriptions](#real-time-subscriptions)
- [Hooks API](#hooks-api)
- [Error Handling](#error-handling)

## Base Configuration

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseKey)
```

## Authentication

### Sign In
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

### Sign Out
```javascript
const { error } = await supabase.auth.signOut()
```

### Get Current User
```javascript
const { data: { user }, error } = await supabase.auth.getUser()
```

## Branches

### Get All Branches
```javascript
const { data, error } = await supabase
  .from('branches')
  .select('*')
```

### Get Branch by ID
```javascript
const { data, error } = await supabase
  .from('branches')
  .select('*')
  .eq('id', 'branch-id')
  .single()
```

### Create Branch
```javascript
const { data, error } = await supabase
  .from('branches')
  .insert([{
    name: 'Main Branch',
    address: '123 Main St',
    phone: '+1234567890',
    tax_rate: 0.08,
    currency: 'USD'
  }])
```

### Update Branch
```javascript
const { data, error } = await supabase
  .from('branches')
  .update({
    name: 'Updated Branch Name'
  })
  .eq('id', 'branch-id')
```

## Users

### Get Users by Branch
```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('branch_id', 'branch-id')
  .eq('is_active', true)
```

### Get Users by Role
```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('role', 'cashier')
  .eq('is_active', true)
```

### Create User
```javascript
const { data, error } = await supabase
  .from('users')
  .insert([{
    email: 'staff@restaurant.com',
    password_hash: 'hashed_password',
    name: 'Staff Name',
    role: 'cashier',
    branch_id: 'branch-id'
  }])
```

### Update User
```javascript
const { data, error } = await supabase
  .from('users')
  .update({
    name: 'Updated Name',
    is_active: false
  })
  .eq('id', 'user-id')
```

## Categories

### Get Categories by Branch
```javascript
const { data, error } = await supabase
  .from('categories')
  .select('*')
  .eq('branch_id', 'branch-id')
  .eq('is_active', true)
  .order('display_order')
```

### Create Category
```javascript
const { data, error } = await supabase
  .from('categories')
  .insert([{
    name: 'Appetizers',
    description: 'Start your meal with these',
    branch_id: 'branch-id',
    display_order: 1
  }])
```

## Products

### Get Products by Branch
```javascript
const { data, error } = await supabase
  .from('products')
  .select(`
    *,
    category:categories(*)
  `)
  .eq('branch_id', 'branch-id')
  .eq('is_active', true)
```

### Get Products by Category
```javascript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', 'category-id')
  .eq('is_active', true)
```

### Search Products
```javascript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .or(`name.ilike.%${query}%,sku.ilike.%${query}%,barcode.ilike.%${query}%`)
  .eq('is_active', true)
```

### Get Product by Barcode
```javascript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('barcode', '1234567890123')
  .eq('is_active', true)
  .single()
```

### Create Product
```javascript
const { data, error } = await supabase
  .from('products')
  .insert([{
    name: 'Burger Deluxe',
    description: 'Juicy beef burger',
    sku: 'BURG001',
    barcode: '1234567890123',
    price: 12.99,
    cost: 5.50,
    stock: 100,
    min_stock: 10,
    category_id: 'category-id',
    branch_id: 'branch-id',
    tax_rate: 0.08
  }])
```

### Update Product Stock
```javascript
const { data, error } = await supabase
  .from('products')
  .update({
    stock: 150,
    updated_at: new Date().toISOString()
  })
  .eq('id', 'product-id')
```

## Restaurant Tables

### Get Tables by Branch
```javascript
const { data, error } = await supabase
  .from('restaurant_tables')
  .select('*')
  .eq('branch_id', 'branch-id')
  .order('table_no')
```

### Get Tables by Status
```javascript
const { data, error } = await supabase
  .from('restaurant_tables')
  .select('*')
  .eq('branch_id', 'branch-id')
  .eq('status', 'available')
```

### Update Table Status
```javascript
const { data, error } = await supabase
  .from('restaurant_tables')
  .update({
    status: 'occupied',
    updated_at: new Date().toISOString()
  })
  .eq('id', 'table-id')
```

### Create Table
```javascript
const { data, error } = await supabase
  .from('restaurant_tables')
  .insert([{
    table_no: 'T15',
    capacity: 6,
    status: 'available',
    branch_id: 'branch-id',
    location: 'outdoor'
  }])
```

## Customers

### Search Customers
```javascript
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
  .eq('is_active', true)
```

### Get Customer by Phone
```javascript
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .eq('phone', '+15551234567')
  .eq('is_active', true)
  .single()
```

### Create Customer
```javascript
const { data, error } = await supabase
  .from('customers')
  .insert([{
    name: 'John Doe',
    phone: '+15551234567',
    email: 'john@example.com',
    branch_id: 'branch-id'
  }])
```

### Update Customer Points
```javascript
// Using RPC function
const { data, error } = await supabase.rpc('update_loyalty_points', {
  customer_id: 'customer-id',
  points_to_add: 50
})
```

## Orders

### Get Orders by Branch
```javascript
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    customer:customers(*),
    table:restaurant_tables(*),
    order_items(*)
  `)
  .eq('branch_id', 'branch-id')
  .order('created_at', { ascending: false })
```

### Get Orders by Status
```javascript
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('branch_id', 'branch-id')
  .eq('status', 'pending')
```

### Get Orders by Table
```javascript
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('table_id', 'table-id')
  .in('status', ['pending', 'confirmed', 'preparing'])
```

### Get Order with Details
```javascript
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    order_items(
      *,
      product:products(*)
    ),
    customer:customers(*),
    table:restaurant_tables(*),
    payments(*)
  `)
  .eq('id', 'order-id')
  .single()
```

### Create Order
```javascript
const { data, error } = await supabase
  .from('orders')
  .insert([{
    branch_id: 'branch-id',
    table_id: 'table-id',
    customer_id: 'customer-id',
    order_type: 'dine_in',
    subtotal: 0,
    total: 0,
    special_requests: 'No onions please'
  }])
```

### Update Order Status
```javascript
const { data, error } = await supabase
  .from('orders')
  .update({
    status: 'completed',
    updated_at: new Date().toISOString()
  })
  .eq('id', 'order-id')
```

## Order Items

### Get Order Items
```javascript
const { data, error } = await supabase
  .from('order_items')
  .select(`
    *,
    product:products(*)
  `)
  .eq('order_id', 'order-id')
```

### Add Order Item
```javascript
const { data, error } = await supabase
  .from('order_items')
  .insert([{
    order_id: 'order-id',
    product_id: 'product-id',
    quantity: 2,
    unit_price: 12.99,
    subtotal: 25.98,
    modifiers: [
      { name: 'Extra Cheese', price: 1.50 }
    ]
  }])
```

### Update Item Status
```javascript
const { data, error } = await supabase
  .from('order_items')
  .update({
    status: 'preparing'
  })
  .eq('id', 'item-id')
```

## Payments

### Get Payments by Order
```javascript
const { data, error } = await supabase
  .from('payments')
  .select('*')
  .eq('order_id', 'order-id')
```

### Process Payment
```javascript
const { data, error } = await supabase
  .from('payments')
  .insert([{
    order_id: 'order-id',
    amount: 49.67,
    method: 'card',
    tip: 7.50,
    card_last4: '1234',
    transaction_id: 'txn_1234567890'
  }])
```

### Update Payment Status
```javascript
const { data, error } = await supabase
  .from('payments')
  .update({
    status: 'completed'
  })
  .eq('id', 'payment-id')
```

## Stock Movements

### Get Stock Movements
```javascript
const { data, error } = await supabase
  .from('stock_movements')
  .select(`
    *,
    product:products(*)
  `)
  .eq('branch_id', 'branch-id')
  .order('created_at', { ascending: false })
```

### Create Stock Movement
```javascript
const { data, error } = await supabase
  .from('stock_movements')
  .insert([{
    product_id: 'product-id',
    branch_id: 'branch-id',
    type: 'purchase',
    quantity: 100,
    reason: 'Supplier delivery',
    created_by: 'user-id'
  }])
```

### Get Stock by Product
```javascript
const { data, error } = await supabase
  .from('stock_movements')
  .select('*')
  .eq('product_id', 'product-id')
  .eq('branch_id', 'branch-id')
```

## Reports

### Daily Sales Report
```javascript
const { data, error } = await supabase.rpc('daily_sales_report', {
  branch_id: 'branch-id',
  report_date: '2024-01-01'
})
```

### Popular Items Report
```javascript
const { data, error } = await supabase.rpc('popular_items', {
  branch_id: 'branch-id',
  start_date: '2024-01-01',
  end_date: '2024-01-31'
})
```

### Kitchen Orders
```javascript
const { data, error } = await supabase.rpc('kitchen_orders', {
  branch_id: 'branch-id',
  status_filter: 'pending'
})
```

### Inventory Report
```javascript
const { data, error } = await supabase.rpc('inventory_report', {
  branch_id: 'branch-id'
})
```

### Staff Performance
```javascript
const { data, error } = await supabase.rpc('get_staff_performance', {
  branch_id: 'branch-id',
  start_date: '2024-01-01',
  end_date: '2024-01-31'
})
```

## Real-time Subscriptions

### Overview

The POS system provides comprehensive real-time functionality using Supabase WebSocket subscriptions. For detailed documentation, see [Real-time API Documentation](realtime-api.md).

### Core Real-time Hook

```javascript
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';

const MyComponent = () => {
  const { channelRef } = useRealtimeSubscription({
    tables: ['orders', 'payments'],
    schema: 'public',
    filter: `branch_id=eq.${user.branch_id}`,
    callback: (payload) => {
      console.log('Real-time event:', payload);
      handleRealtimeEvent(payload);
    }
  });

  return <div>Real-time updates enabled</div>;
};
```

### Specialized Real-time Hooks

```javascript
// Order management real-time updates
import { useOrderRealtime } from '../hooks/useRealtimeSubscription';

const OrderComponent = () => {
  useOrderRealtime(); // Auto-subscribes to orders and order_items
  // Handle new orders, status changes, etc.
};

// Kitchen display real-time updates
import { useKitchenRealtime } from '../hooks/useRealtimeSubscription';

const KitchenDisplay = () => {
  useKitchenRealtime(); // Auto-subscribes to kitchen-specific events
  // Handle item readiness, order preparation status
};

// Inventory real-time updates
import { useInventoryRealtime } from '../hooks/useRealtimeSubscription';

const InventoryComponent = () => {
  useInventoryRealtime(); // Auto-subscribes to stock movements
  // Handle low stock alerts, inventory changes
};
```

### Manual WebSocket Subscriptions

#### Subscribe to Order Updates
```javascript
const orderSubscription = supabase
  .channel('orders')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'orders',
      filter: 'branch_id=eq.branch-id'
    },
    (payload) => {
      console.log('Order updated:', payload)
      handleOrderUpdate(payload)
    }
  )
  .subscribe()
```

#### Subscribe to Table Status Changes
```javascript
const tableSubscription = supabase
  .channel('tables')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'restaurant_tables'
    },
    (payload) => {
      handleTableStatusChange(payload)
    }
  )
  .subscribe()
```

### Subscribe to Product Stock Changes
```javascript
const stockSubscription = supabase
  .channel('stock')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'products'
    },
    (payload) => {
      if (payload.new.stock !== payload.old.stock) {
        handleStockChange(payload)
      }
    }
  )
  .subscribe()
```

### Unsubscribe
```javascript
supabase.removeChannel(orderSubscription)
```

## Hooks API

### useAuth

Authentication and authorization hook.

```javascript
import { useAuth } from '../hooks/useAuth';

const LoginComponent = () => {
  const {
    user,
    loading,
    login,
    logout,
    register,
    hasRole,
    canAccess
  } = useAuth();

  const handleLogin = async (email, password) => {
    await login(email, password);
  };

  return (
    <div>
      {loading ? 'Loading...' : user ? 'Welcome!' : 'Please login'}
    </div>
  );
};
```

**Properties:**
- `user`: Current user object
- `loading`: Loading state
- `error`: Error state
- `login(email, password)`: Sign in function
- `logout()`: Sign out function
- `register(email, password, userData)`: Sign up function
- `hasRole(role)`: Check if user has specific role
- `canAccess(resource, action)`: Check permissions

### useOrder

Order management hook with real-time updates.

```javascript
import { useOrder } from '../hooks/useOrder';

const OrderComponent = () => {
  const {
    orders,
    isLoading,
    createOrder,
    updateOrder,
    addOrderItem,
    removeOrderItem,
    cancelOrder,
    getOrdersByStatus,
    calculateOrderTotals
  } = useOrder();

  const handleNewOrder = async (orderData) => {
    await createOrder(orderData);
  };

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          Order #{order.id} - {calculateOrderTotals(order).total}
        </div>
      ))}
    </div>
  );
};
```

### usePayment

Payment processing hook.

```javascript
import { usePayment } from '../hooks/usePayment';

const PaymentComponent = () => {
  const {
    processPayment,
    refundPayment,
    calculatePaymentBreakdown,
    validatePaymentData
  } = usePayment();

  const handlePayment = async (paymentData) => {
    await processPayment(paymentData);
  };

  return <div>Payment Processing</div>;
};
```

### useKitchen

Kitchen display system hook with real-time updates.

```javascript
import { useKitchen } from '../hooks/useKitchen';

const KitchenDisplay = () => {
  const {
    kitchenOrders,
    isLoading,
    updateOrderStatus,
    startPreparation,
    markReady,
    getOrdersByStatus,
    getOrderUrgency
  } = useKitchen();

  const pendingOrders = getOrdersByStatus('pending');

  return (
    <div>
      <h2>Kitchen Orders</h2>
      {pendingOrders.map(order => (
        <div key={order.id}>
          Order #{order.id.slice(-6)}
          <button onClick={() => startPreparation(order.id)}>
            Start Preparation
          </button>
        </div>
      ))}
    </div>
  );
};
```

### useInventory

Inventory management hook with real-time stock tracking.

```javascript
import { useInventory } from '../hooks/useInventory';

const InventoryComponent = () => {
  const {
    products,
    lowStockProducts,
    isLoading,
    adjustStock,
    bulkAdjustStock,
    getInventorySummary,
    validateStockAdjustment
  } = useInventory();

  const handleStockAdjustment = async (productId, quantity) => {
    await adjustStock({
      product_id: productId,
      branch_id: user.branch_id,
      adjustment_type: 'increase',
      quantity,
      reason: 'Stock received'
    });
  };

  return (
    <div>
      <h3>Low Stock Products: {lowStockProducts.length}</h3>
      {products.map(product => (
        <div key={product.id}>
          {product.name}: {product.current_stock} units
        </div>
      ))}
    </div>
  );
};
```

### useCart

Shopping cart management hook.

```javascript
import { useCart } from '../hooks/useCart';

const CartComponent = () => {
  const {
    items,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount
  } = useCart();

  return (
    <div>
      <h3>Cart ({itemCount} items)</h3>
      <div>Total: ${total.toFixed(2)}</div>
      {items.map(item => (
        <div key={item.id}>
          {item.name} - ${item.price} x {item.quantity}
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
};
```

### useRealtimeSubscription

Generic real-time subscription hook.

```javascript
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';

const RealtimeComponent = () => {
  const { channelRef } = useRealtimeSubscription({
    tables: ['orders', 'payments'],
    filter: `branch_id=eq.${user.branch_id}`,
    callback: (payload) => {
      console.log('Real-time event:', payload);
    }
  });

  return <div>Listening for real-time updates</div>;
};
```

### useKeyboardShortcuts

Keyboard shortcuts management hook.

```javascript
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const ShortcutComponent = () => {
  useKeyboardShortcuts({
    'F2': () => console.log('Open payment dialog'),
    'F3': () => console.log('Search customer'),
    'Ctrl+S': () => console.log('Save order'),
    'Escape': () => console.log('Cancel current action')
  });

  return <div>Keyboard shortcuts enabled</div>;
};
```

## Error Handling

### Common Error Patterns
```javascript
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('id', 'order-id')

if (error) {
  switch (error.code) {
    case 'PGRST116': // Not found
      console.error('Order not found:', error.message)
      break
    case '23505': // Unique violation
      console.error('Duplicate order:', error.message)
      break
    case '42501': // Permission denied
      console.error('Access denied:', error.message)
      break
    default:
      console.error('Database error:', error)
  }
}
```

### Handling Network Issues
```javascript
try {
  const { data, error } = await supabase
    .from('orders')
    .select('*')

  if (error) throw error

  return data
} catch (error) {
  console.error('Network or database error:', error)
  // Implement retry logic or offline handling
  throw error
}
```

## Data Validation

### Input Validation Examples
```javascript
// Validate order creation
function validateOrder(orderData) {
  const errors = []

  if (!orderData.branch_id) {
    errors.push('Branch ID is required')
  }

  if (!['dine_in', 'takeaway', 'delivery'].includes(orderData.order_type)) {
    errors.push('Invalid order type')
  }

  if (orderData.total < 0) {
    errors.push('Total cannot be negative')
  }

  return errors
}

// Use before sending to database
const validationErrors = validateOrder(orderData)
if (validationErrors.length > 0) {
  throw new Error(validationErrors.join(', '))
}
```

## Pagination

### Paginated Queries
```javascript
const { data, error, count } = await supabase
  .from('orders')
  .select('*', { count: 'exact' })
  .eq('branch_id', 'branch-id')
  .order('created_at', { ascending: false })
  .range(0, 19) // First 20 items

// For next page
const { data: nextPage, error: nextError } = await supabase
  .from('orders')
  .select('*')
  .eq('branch_id', 'branch-id')
  .order('created_at', { ascending: false })
  .range(20, 39) // Next 20 items
```

## Rate Limiting

### Implement Rate Limiting
```javascript
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindow
    this.requests = []
  }

  canMakeRequest() {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.timeWindow)

    if (this.requests.length >= this.maxRequests) {
      return false
    }

    this.requests.push(now)
    return true
  }
}

const apiLimiter = new RateLimiter(100, 60000) // 100 requests per minute

async function makeAPICall(callFunction) {
  if (!apiLimiter.canMakeRequest()) {
    throw new Error('Rate limit exceeded')
  }

  return await callFunction()
}
```

## Response Format

### Standard Response Structure
```javascript
// Successful response
{
  data: [...], // Array of records or single object
  error: null,
  count: 10, // Total count (for paginated queries)
  status: 200
}

// Error response
{
  data: null,
  error: {
    message: 'Error description',
    code: 'PGRST116',
    details: 'Additional error details'
  },
  status: 404
}
```

---

## Testing Endpoints

### Postman Collection Example
```json
{
  "info": {
    "name": "Restaurant POS API",
    "description": "API collection for testing POS endpoints"
  },
  "variable": [
    {
      "key": "supabaseUrl",
      "value": "https://your-project.supabase.co"
    },
    {
      "key": "supabaseKey",
      "value": "your-anon-key"
    }
  ]
}
```

### Example Test Script
```javascript
// Test order creation
async function testOrderCreation() {
  const testData = {
    branch_id: 'test-branch-id',
    order_type: 'dine_in',
    subtotal: 25.98,
    total: 28.06
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([testData])
      .select()
      .single()

    if (error) throw error

    console.log('✅ Order created successfully:', data.id)
    return data
  } catch (error) {
    console.error('❌ Order creation failed:', error.message)
    throw error
  }
}
```

This API reference provides comprehensive documentation for all endpoints, including examples, error handling, and best practices for production use.