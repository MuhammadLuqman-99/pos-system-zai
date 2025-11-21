-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- BRANCHES POLICIES
-- ========================================

-- Branches can be viewed by all authenticated users
CREATE POLICY "Branches are viewable by all authenticated users"
ON branches FOR SELECT
USING (auth.role() = 'authenticated');

-- Only owners can manage branches
CREATE POLICY "Owners can manage branches"
ON branches FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'owner'
        AND users.is_active = true
    )
);

-- ========================================
-- USERS POLICIES
-- ========================================

-- Users can view users in their branch (managers+)
CREATE POLICY "Users can view branch users"
ON users FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND (
        -- Can view own profile
        users.id = auth.uid()
        -- Owners can view all users
        OR EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'owner'
            AND u.is_active = true
        )
        -- Managers can view users in their branch
        OR EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'manager'
            AND u.is_active = true
            AND u.branch_id = users.branch_id
        )
    )
);

-- Owners can manage all users
CREATE POLICY "Owners can manage all users"
ON users FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role = 'owner'
        AND u.is_active = true
    )
);

-- Managers can manage non-owner users in their branch
CREATE POLICY "Managers can manage branch users"
ON users FOR UPDATE
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role = 'manager'
        AND u.is_active = true
        AND u.branch_id = users.branch_id
        AND users.role != 'owner'
    )
);

-- ========================================
-- CATEGORIES POLICIES
-- ========================================

-- Categories can be viewed by users in the same branch
CREATE POLICY "Categories are viewable by branch users"
ON categories FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_active = true
        AND (
            -- Owners can view all categories
            users.role = 'owner'
            -- Others can only view categories in their branch
            OR users.branch_id = categories.branch_id
        )
    )
);

-- Managers+ can manage categories in their branch
CREATE POLICY "Managers can manage branch categories"
ON categories FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_active = true
        AND (
            -- Owners can manage all categories
            users.role = 'owner'
            -- Managers can manage categories in their branch
            OR (users.role = 'manager' AND users.branch_id = categories.branch_id)
        )
    )
);

-- ========================================
-- PRODUCTS POLICIES
-- ========================================

-- Products can be viewed by users in the same branch
CREATE POLICY "Products are viewable by branch users"
ON products FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_active = true
        AND (
            -- Owners can view all products
            users.role = 'owner'
            -- Others can only view products in their branch
            OR users.branch_id = products.branch_id
        )
    )
);

-- Managers+ can manage products in their branch
CREATE POLICY "Managers can manage branch products"
ON products FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_active = true
        AND (
            -- Owners can manage all products
            users.role = 'owner'
            -- Managers can manage products in their branch
            OR (users.role = 'manager' AND users.branch_id = products.branch_id)
        )
    )
);

-- ========================================
-- RESTAURANT TABLES POLICIES
-- ========================================

-- Tables can be viewed by users in the same branch
CREATE POLICY "Tables are viewable by branch users"
ON restaurant_tables FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_active = true
        AND (
            -- Owners can view all tables
            users.role = 'owner'
            -- Others can only view tables in their branch
            OR users.branch_id = restaurant_tables.branch_id
        )
    )
);

-- Managers+ and waitstaff can update tables in their branch
CREATE POLICY "Staff can update branch tables"
ON restaurant_tables FOR UPDATE
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_active = true
        AND (
            -- Owners can update all tables
            users.role = 'owner'
            -- Managers and waitstaff can update tables in their branch
            OR (users.role IN ('manager', 'waitstaff') AND users.branch_id = restaurant_tables.branch_id)
        )
    )
);

-- ========================================
-- CUSTOMERS POLICIES
-- ========================================

-- Customers can be viewed by users in the same branch
CREATE POLICY "Customers are viewable by branch users"
ON customers FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_active = true
        AND (
            -- Owners can view all customers
            users.role = 'owner'
            -- Others can only view customers in their branch
            OR users.branch_id = customers.branch_id
        )
    )
);

-- Managers+ can manage customers in their branch
CREATE POLICY "Managers can manage branch customers"
ON customers FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_active = true
        AND (
            -- Owners can manage all customers
            users.role = 'owner'
            -- Managers can manage customers in their branch
            OR (users.role = 'manager' AND users.branch_id = customers.branch_id)
        )
    )
);

-- Cashiers and waitstaff can create customers
CREATE POLICY "Staff can create customers"
ON customers FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_active = true
        AND users.role IN ('cashier', 'waitstaff', 'manager', 'owner')
        AND (
            -- Owners can create customers for any branch
            users.role = 'owner'
            -- Others can only create customers for their branch
            OR users.branch_id = customers.branch_id
        )
    )
);

-- ========================================
-- ORDERS POLICIES
-- ========================================

-- Orders can be viewed by users in the same branch
CREATE POLICY "Orders are viewable by branch users"
ON orders FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_active = true
        AND (
            -- Owners can view all orders
            users.role = 'owner'
            -- Others can only view orders in their branch
            OR users.branch_id = orders.branch_id
        )
    )
);

-- Staff can create orders in their branch
CREATE POLICY "Staff can create orders"
ON orders FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_active = true
        AND users.role IN ('cashier', 'waitstaff', 'manager', 'owner')
        AND (
            -- Owners can create orders for any branch
            users.role = 'owner'
            -- Others can only create orders for their branch
            OR users.branch_id = orders.branch_id
        )
    )
    -- Set cashier to current user
    AND orders.cashier_id = auth.uid()
);

-- Staff can update orders in their branch
CREATE POLICY "Staff can update orders"
ON orders FOR UPDATE
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_active = true
        AND (
            -- Owners can update all orders
            users.role = 'owner'
            -- Others can only update orders in their branch
            OR users.branch_id = orders.branch_id
        )
    )
    -- Cashiers and waitstaff can only update orders they created
    AND (
        users.role IN ('cashier', 'waitstaff')
        OR users.role IN ('manager', 'owner')
    )
);

-- Kitchen staff can update order status
CREATE POLICY "Kitchen can update order status"
ON orders FOR UPDATE
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'kitchen'
        AND users.is_active = true
        AND users.branch_id = orders.branch_id
    )
    -- Only allow status updates
    AND (
        (orders.status IS DISTINCT FROM OLD.status)
        AND (
            orders.payment_status = OLD.payment_status
            AND orders.total = OLD.total
            AND orders.subtotal = OLD.subtotal
        )
    )
);

-- ========================================
-- ORDER ITEMS POLICIES
-- ========================================

-- Order items can be viewed by users in the same branch
CREATE POLICY "Order items are viewable by branch users"
ON order_items FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM orders o
        JOIN users u ON u.id = auth.uid()
        WHERE o.id = order_items.order_id
        AND u.is_active = true
        AND (
            -- Owners can view all order items
            u.role = 'owner'
            -- Others can only view order items in their branch
            OR u.branch_id = o.branch_id
        )
    )
);

-- Staff can manage order items for orders they can access
CREATE POLICY "Staff can manage order items"
ON order_items FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM orders o
        JOIN users u ON u.id = auth.uid()
        WHERE o.id = order_items.order_id
        AND u.is_active = true
        AND (
            -- Owners can manage all order items
            u.role = 'owner'
            -- Others can only manage order items in their branch
            OR u.branch_id = o.branch_id
        )
        -- Kitchen staff can only update item status
        AND (
            u.role != 'kitchen'
            OR (
                order_items.status IS DISTINCT FROM OLD.status
                AND order_items.quantity = OLD.quantity
                AND order_items.unit_price = OLD.unit_price
            )
        )
        -- Cashiers and waitstaff can only manage items for orders they created
        AND (
            u.role IN ('manager', 'owner')
            OR o.cashier_id = auth.uid()
        )
    )
);

-- ========================================
-- PAYMENTS POLICIES
-- ========================================

-- Payments can be viewed by users in the same branch
CREATE POLICY "Payments are viewable by branch users"
ON payments FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM orders o
        JOIN users u ON u.id = auth.uid()
        WHERE o.id = payments.order_id
        AND u.is_active = true
        AND (
            -- Owners can view all payments
            u.role = 'owner'
            -- Others can only view payments in their branch
            OR u.branch_id = o.branch_id
        )
    )
);

-- Staff can create payments for orders they can access
CREATE POLICY "Staff can create payments"
ON payments FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM orders o
        JOIN users u ON u.id = auth.uid()
        WHERE o.id = payments.order_id
        AND u.is_active = true
        AND u.role IN ('cashier', 'waitstaff', 'manager', 'owner')
        AND (
            -- Owners can create payments for any branch
            u.role = 'owner'
            -- Others can only create payments for their branch
            OR u.branch_id = o.branch_id
        )
        -- Only for orders they created or are managers/owners
        AND (
            u.role IN ('manager', 'owner')
            OR o.cashier_id = auth.uid()
        )
    )
);

-- ========================================
-- STOCK MOVEMENTS POLICIES
-- ========================================

-- Stock movements can be viewed by users in the same branch
CREATE POLICY "Stock movements are viewable by branch users"
ON stock_movements FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_active = true
        AND (
            -- Owners can view all stock movements
            users.role = 'owner'
            -- Others can only view stock movements in their branch
            OR users.branch_id = stock_movements.branch_id
        )
    )
);

-- Managers+ and kitchen staff can create stock movements
CREATE POLICY "Staff can create stock movements"
ON stock_movements FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_active = true
        AND users.role IN ('manager', 'kitchen', 'owner')
        AND (
            -- Owners can create stock movements for any branch
            users.role = 'owner'
            -- Others can only create stock movements for their branch
            OR users.branch_id = stock_movements.branch_id
        )
    )
    -- Set created_by to current user
    AND stock_movements.created_by = auth.uid()
);

-- ========================================
-- ACTIVITY LOGS POLICIES
-- ========================================

-- Activity logs can be viewed by managers and owners
CREATE POLICY "Activity logs are viewable by managers and owners"
ON activity_logs FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_active = true
        AND users.role IN ('manager', 'owner')
        AND (
            -- Owners can view all activity logs
            users.role = 'owner'
            -- Managers can only view activity logs in their branch
            OR users.branch_id = activity_logs.branch_id
        )
    )
);

-- System can create activity logs
CREATE POLICY "System can create activity logs"
ON activity_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- ========================================
-- LOYALTY PROGRAMS POLICIES
-- ========================================

-- Loyalty programs can be viewed by all authenticated users
CREATE POLICY "Loyalty programs are viewable by all authenticated users"
ON loyalty_programs FOR SELECT
USING (auth.role() = 'authenticated');

-- Only owners can manage loyalty programs
CREATE POLICY "Owners can manage loyalty programs"
ON loyalty_programs FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'owner'
        AND users.is_active = true
    )
);

-- ========================================
-- TABLE ORDERS POLICIES
-- ========================================

-- Table orders can be viewed by users in the same branch
CREATE POLICY "Table orders are viewable by branch users"
ON table_orders FOR SELECT
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM orders o
        JOIN users u ON u.id = auth.uid()
        WHERE o.id = table_orders.order_id
        AND u.is_active = true
        AND (
            -- Owners can view all table orders
            u.role = 'owner'
            -- Others can only view table orders in their branch
            OR u.branch_id = o.branch_id
        )
    )
);

-- Staff can manage table orders
CREATE POLICY "Staff can manage table orders"
ON table_orders FOR ALL
USING (
    auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM orders o
        JOIN users u ON u.id = auth.uid()
        WHERE o.id = table_orders.order_id
        AND u.is_active = true
        AND (
            -- Owners can manage all table orders
            u.role = 'owner'
            -- Others can only manage table orders in their branch
            OR u.branch_id = o.branch_id
        )
        -- Waitstaff and managers can manage table orders
        AND u.role IN ('waitstaff', 'manager', 'owner')
    )
);