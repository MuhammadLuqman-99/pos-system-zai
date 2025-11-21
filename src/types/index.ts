export type UserRole = 'owner' | 'manager' | 'cashier' | 'kitchen' | 'waitstaff';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'voided';
export type PaymentMethod = 'cash' | 'card' | 'mobile' | 'voucher' | 'loyalty_points';
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';
export type MovementType = 'purchase' | 'sale' | 'adjustment' | 'waste' | 'transfer' | 'return';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branch_id?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_rate: number;
  currency: string;
  timezone: string;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  branch_id?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  category_id?: string;
  branch_id?: string;
  tax_rate: number;
  image_url?: string;
  ingredients?: string[];
  allergens?: string[];
  preparation_time: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface RestaurantTable {
  id: string;
  table_no: string;
  capacity: number;
  status: TableStatus;
  branch_id?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description?: string;
  points_per_dollar: number;
  tiers: Array<{
    name: string;
    min_points: number;
    discount_rate: number;
  }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  branch_id?: string;
  loyalty_program_id?: string;
  loyalty_tier?: string;
  points: number;
  total_spent: number;
  visits: number;
  birth_date?: string;
  address?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_no: string;
  branch_id?: string;
  table_id?: string;
  customer_id?: string;
  cashier_id?: string;
  status: OrderStatus;
  order_type: OrderType;
  subtotal: number;
  discount: number;
  tax: number;
  service_charge: number;
  total: number;
  payment_status: PaymentStatus;
  special_requests?: string;
  estimated_time?: number;
  actual_time?: number;
  created_at: string;
  updated_at: string;
  table?: RestaurantTable;
  customer?: Customer;
  cashier?: User;
  order_items?: OrderItem[];
  payments?: Payment[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  modifiers: Array<{
    name: string;
    price: number;
  }>;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface TableOrder {
  id: string;
  order_id: string;
  table_id: string;
  customer_id?: string;
  status: string;
  assigned_at: string;
  seated_at?: string;
  completed_at?: string;
  waiter_id?: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: PaymentMethod;
  status: string;
  transaction_id?: string;
  card_last4?: string;
  tip: number;
  cash_received?: number;
  change_given?: number;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  branch_id?: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  reference_id?: string;
  reference_table?: string;
  created_by?: string;
  created_at: string;
  product?: Product;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  branch_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: User;
}

// UI State Types
export interface CartItem {
  product: Product;
  quantity: number;
  modifiers: Array<{
    name: string;
    price: number;
  }>;
  notes?: string;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  service_charge: number;
  discount: number;
  total: number;
  customer?: Customer;
  special_requests?: string;
}

export interface KitchenOrder {
  order: Order;
  items: OrderItem[];
  time_elapsed: number;
  priority: 'normal' | 'urgent' | 'vip';
}

// Report Types
export interface DailySalesReport {
  total_sales: number;
  order_count: number;
  average_order: number;
  payment_breakdown: Record<PaymentMethod, number>;
  tax_collected: number;
  tips_total: number;
}

export interface ShiftReport {
  user_id: string;
  start_time: string;
  end_time: string;
  total_sales: number;
  order_count: number;
  cash_sales: number;
  card_sales: number;
  tips_total: number;
  orders: Order[];
}

export interface PopularItem {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
}

export interface InventoryReport {
  product_name: string;
  current_stock: number;
  min_stock: number;
  stock_value: number;
  days_of_supply: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T[];
  error: null | string;
  count: number;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Device Integration Types
export interface PrinterConfig {
  type: 'thermal' | 'inkjet' | 'laser';
  port: string;
  baudRate?: number;
  width?: number;
  height?: number;
  paperWidth?: number;
}

export interface ScannerConfig {
  type: 'camera' | 'usb' | 'bluetooth';
  device?: string;
  resolution?: number;
}

// Real-time Subscription Types
export interface RealtimeUpdatePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  new: T;
  old: T;
}