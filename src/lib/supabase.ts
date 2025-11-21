import { createClient } from '@supabase/supabase-js';
import { User, Branch, UserRole } from '../types';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
});

// Auth helpers
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  return { data, error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Database query helpers
export class SupabaseService<T = any> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async getAll(filters?: Record<string, any>) {
    let query = supabase.from(this.tableName).select('*');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;
    return { data, error };
  }

  async getById(id: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  }

  async create(item: Partial<T>) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(item)
      .select()
      .single();
    return { data, error };
  }

  async update(id: string, updates: Partial<T>) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  async delete(id: string) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    return { error };
  }

  // Real-time subscription
  subscribe(callback: (payload: any) => void) {
    return supabase
      .channel(`changes_${this.tableName}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: this.tableName },
        callback
      )
      .subscribe();
  }
}

// Specific services
export class UserService extends SupabaseService<User> {
  constructor() {
    super('users');
  }

  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();
    return { data, error };
  }

  async getByBranch(branchId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('branch_id', branchId)
      .eq('is_active', true);
    return { data, error };
  }

  async getByRole(role: UserRole) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('role', role)
      .eq('is_active', true);
    return { data, error };
  }
}

export class BranchService extends SupabaseService<Branch> {
  constructor() {
    super('branches');
  }
}

export class ProductService extends SupabaseService {
  constructor() {
    super('products');
  }

  async getByBranch(branchId: string, active: boolean = true) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        category:categories(*)
      `)
      .eq('branch_id', branchId)
      .eq('is_active', active)
      .order('name');
    return { data, error };
  }

  async getByCategory(categoryId: string, branchId?: string) {
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        category:categories(*)
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true);

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query.order('name');
    return { data, error };
  }

  async getByBarcode(barcode: string, branchId?: string) {
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        category:categories(*)
      `)
      .eq('barcode', barcode)
      .eq('is_active', true);

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query.single();
    return { data, error };
  }

  async search(query: string, branchId?: string) {
    let dbQuery = supabase
      .from(this.tableName)
      .select(`
        *,
        category:categories(*)
      `)
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%,barcode.ilike.%${query}%`)
      .eq('is_active', true);

    if (branchId) {
      dbQuery = dbQuery.eq('branch_id', branchId);
    }

    const { data, error } = await dbQuery.order('name');
    return { data, error };
  }
}

export class CategoryService extends SupabaseService {
  constructor() {
    super('categories');
  }

  async getByBranch(branchId: string, active: boolean = true) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('branch_id', branchId)
      .eq('is_active', active)
      .order('display_order');
    return { data, error };
  }
}

export class OrderService extends SupabaseService {
  constructor() {
    super('orders');
  }

  async getWithDetails(id: string) {
    const { data, error } = await supabase
      .from(this.tableName)
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
      .eq('id', id)
      .single();
    return { data, error };
  }

  async getByBranch(branchId: string, status?: OrderStatus) {
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        customer:customers(*),
        table:restaurant_tables(*),
        order_items(*)
      `)
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    return { data, error };
  }

  async getByTable(tableId: string, activeOnly: boolean = true) {
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        order_items(
          *,
          product:products(*)
        ),
        customer:customers(*)
      `)
      .eq('table_id', tableId);

    if (activeOnly) {
      query = query.in('status', ['pending', 'confirmed', 'preparing', 'ready']);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  }
}

export class TableService extends SupabaseService {
  constructor() {
    super('restaurant_tables');
  }

  async getByBranch(branchId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('branch_id', branchId)
      .order('table_no');
    return { data, error };
  }

  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
}

export class CustomerService extends SupabaseService {
  constructor() {
    super('customers');
  }

  async search(query: string, branchId?: string) {
    let dbQuery = supabase
      .from(this.tableName)
      .select('*')
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
      .eq('is_active', true);

    if (branchId) {
      dbQuery = dbQuery.eq('branch_id', branchId);
    }

    const { data, error } = await dbQuery.order('name');
    return { data, error };
  }

  async getByPhone(phone: string, branchId?: string) {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('phone', phone)
      .eq('is_active', true);

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query.single();
    return { data, error };
  }

  async updateLoyaltyPoints(id: string, points: number) {
    const { data, error } = await supabase.rpc('update_loyalty_points', {
      customer_id: id,
      points_to_add: points
    });
    return { data, error };
  }
}

// RPC function calls for complex queries
export const getDailySalesReport = async (branchId: string, date: string) => {
  const { data, error } = await supabase.rpc('daily_sales_report', {
    branch_id: branchId,
    date: date
  });
  return { data, error };
};

export const getKitchenOrders = async (branchId: string, status?: string) => {
  const { data, error } = await supabase.rpc('kitchen_orders', {
    branch_id: branchId,
    status_filter: status || 'pending'
  });
  return { data, error };
};

export const getPopularItems = async (branchId: string, startDate: string, endDate: string) => {
  const { data, error } = await supabase.rpc('popular_items', {
    branch_id: branchId,
    start_date: startDate,
    end_date: endDate
  });
  return { data, error };
};

export const getInventoryReport = async (branchId: string) => {
  const { data, error } = await supabase.rpc('inventory_report', {
    branch_id: branchId
  });
  return { data, error };
};

// Missing critical service classes that need to be implemented:
export class OrderItemService extends SupabaseService {
  constructor() {
    super('order_items');
  }

  async getByOrder(orderId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        product:products(*)
      `)
      .eq('order_id', orderId)
      .order('created_at');
    return { data, error };
  }

  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
}

export class PaymentService extends SupabaseService {
  constructor() {
    super('payments');
  }

  async getByOrder(orderId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    return { data, error };
  }

  async processPayment(paymentData: any) {
    // This would integrate with Stripe or other payment processors
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        ...paymentData,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    return { data, error };
  }

  async updateStatus(id: string, status: string, transactionId?: string) {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (transactionId) {
      updateData.transaction_id = transactionId;
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }
}

export class StockService extends SupabaseService {
  constructor() {
    super('stock_movements');
  }

  async getByProduct(productId: string, branchId?: string) {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query.limit(100);
    return { data, error };
  }

  async adjustStock(movementData: any) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        ...movementData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    return { data, error };
  }

  async getLowStock(branchId: string) {
    const { data, error } = await supabase.rpc('low_stock_products', {
      branch_id: branchId
    });
    return { data, error };
  }
}

export class ActivityLogService extends SupabaseService {
  constructor() {
    super('activity_logs');
  }

  async logActivity(activityData: any) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        ...activityData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    return { data, error };
  }

  async getUserActivity(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  }

  async getBranchActivity(branchId: string, limit: number = 100) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  }
}

export class LoyaltyService extends SupabaseService {
  constructor() {
    super('loyalty_programs');
  }

  async getActivePrograms(branchId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('branch_id', branchId)
      .eq('is_active', true)
      .order('points_per_amount');

    return { data, error };
  }

  async calculateRewards(customerId: string, orderId: string) {
    const { data, error } = await supabase.rpc('calculate_loyalty_rewards', {
      customer_id: customerId,
      order_id: orderId
    });
    return { data, error };
  }

  async redeemPoints(customerId: string, points: number, orderId: string) {
    const { data, error } = await supabase.rpc('redeem_loyalty_points', {
      customer_id: customerId,
      points_to_redeem: points,
      order_id: orderId
    });
    return { data, error };
  }
}

export class TableOrderService extends SupabaseService {
  constructor() {
    super('table_orders');
  }

  async getActiveOrders(branchId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        table:restaurant_tables(*),
        orders(
          *,
          order_items(
            *,
            product:products(*)
          )
        )
      `)
      .eq('branch_id', branchId)
      .in('status', ['occupied', 'ordered'])
      .order('created_at', { ascending: false });

    return { data, error };
  }

  async seatCustomers(tableId: string, customerId?: string, numberOfGuests: number = 1) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert({
        table_id: tableId,
        customer_id: customerId,
        number_of_guests: numberOfGuests,
        status: 'occupied',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    return { data, error };
  }

  async closeTable(tableId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        status: 'completed',
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('table_id', tableId)
      .eq('status', 'occupied')
      .select()
      .single();

    return { data, error };
  }
}

// Initialize all services
export const userService = new UserService();
export const branchService = new BranchService();
export const productService = new ProductService();
export const categoryService = new CategoryService();
export const orderService = new OrderService();
export const tableService = new TableService();
export const customerService = new CustomerService();
export const orderItemService = new OrderItemService();
export const paymentService = new PaymentService();
export const stockService = new StockService();
export const activityLogService = new ActivityLogService();
export const loyaltyService = new LoyaltyService();
export const tableOrderService = new TableOrderService();