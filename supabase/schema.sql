-- ========================================
-- RESTAURANT POS SYSTEM - SUPABASE SCHEMA
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'cashier', 'kitchen', 'waitstaff');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled');
CREATE TYPE order_type AS ENUM ('dine_in', 'takeaway', 'delivery');
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid', 'refunded', 'voided');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'mobile', 'voucher', 'loyalty_points');
CREATE TYPE table_status AS ENUM ('available', 'occupied', 'reserved', 'cleaning');
CREATE TYPE movement_type AS ENUM ('purchase', 'sale', 'adjustment', 'waste', 'transfer', 'return');

-- ========================================
-- TABLES
-- ========================================

-- Branches table
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    tax_rate DECIMAL(5,4) DEFAULT 0.0000,
    currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    branch_id UUID REFERENCES branches(id),
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    branch_id UUID REFERENCES branches(id),
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    barcode VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    stock DECIMAL(10,3) DEFAULT 0,
    min_stock DECIMAL(10,3) DEFAULT 0,
    category_id UUID REFERENCES categories(id),
    branch_id UUID REFERENCES branches(id),
    tax_rate DECIMAL(5,4) DEFAULT 0.0000,
    image_url TEXT,
    ingredients JSONB DEFAULT '[]',
    allergens JSONB DEFAULT '[]',
    preparation_time INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurant tables
CREATE TABLE restaurant_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_no VARCHAR(10) NOT NULL,
    capacity INTEGER NOT NULL,
    status table_status DEFAULT 'available',
    branch_id UUID REFERENCES branches(id),
    location VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(branch_id, table_no)
);

-- Customer loyalty programs
CREATE TABLE loyalty_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    points_per_dollar DECIMAL(5,2) DEFAULT 1.00,
    tiers JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255),
    name VARCHAR(100),
    branch_id UUID REFERENCES branches(id),
    loyalty_program_id UUID REFERENCES loyalty_programs(id),
    loyalty_tier VARCHAR(50),
    points DECIMAL(10,2) DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    visits INTEGER DEFAULT 0,
    birth_date DATE,
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no VARCHAR(20) UNIQUE NOT NULL,
    branch_id UUID REFERENCES branches(id),
    table_id UUID REFERENCES restaurant_tables(id),
    customer_id UUID REFERENCES customers(id),
    cashier_id UUID REFERENCES users(id),
    status order_status DEFAULT 'pending',
    order_type order_type NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    service_charge DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    special_requests TEXT,
    estimated_time INTEGER,
    actual_time INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    modifiers JSONB DEFAULT '[]',
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table orders (for restaurant seating)
CREATE TABLE table_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    table_id UUID REFERENCES restaurant_tables(id),
    customer_id UUID REFERENCES customers(id),
    status VARCHAR(20) DEFAULT 'active',
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    seated_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    waiter_id UUID REFERENCES users(id),
    special_requests TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    amount DECIMAL(10,2) NOT NULL,
    method payment_method NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(100),
    card_last4 VARCHAR(4),
    tip DECIMAL(10,2) DEFAULT 0,
    cash_received DECIMAL(10,2),
    change_given DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock movements
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    branch_id UUID REFERENCES branches(id),
    type movement_type NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    reason TEXT,
    reference_id UUID,
    reference_table VARCHAR(50),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs for audit trail
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    branch_id UUID REFERENCES branches(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

CREATE INDEX idx_products_branch_category ON products(branch_id, category_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_branch_status ON orders(branch_id, status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_stock_movements_product_branch ON stock_movements(product_id, branch_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_restaurant_tables_branch_status ON restaurant_tables(branch_id, status);
CREATE INDEX idx_table_orders_table ON table_orders(table_id);
CREATE INDEX idx_table_orders_order ON table_orders(order_id);

-- ========================================
-- FUNCTIONS
-- ========================================

-- Generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_no IS NULL THEN
        NEW.order_no := 'ORD' || LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0') ||
                      LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0') ||
                      LPAD(EXTRACT(YEAR FROM NOW())::TEXT, 4, '0') ||
                      LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger for order number generation
CREATE TRIGGER set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON restaurant_tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_table_orders_updated_at BEFORE UPDATE ON table_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loyalty_programs_updated_at BEFORE UPDATE ON loyalty_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STORED PROCEDURES FOR REPORTS
-- ========================================

-- Daily sales report
CREATE OR REPLACE FUNCTION daily_sales_report(branch_id_param UUID, report_date DATE)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_sales', COALESCE(SUM(o.total), 0),
        'order_count', COUNT(o.id),
        'average_order', COALESCE(AVG(o.total), 0),
        'payment_breakdown', (
            SELECT json_build_object(
                'cash', COALESCE(SUM(CASE WHEN p.method = 'cash' THEN p.amount ELSE 0 END), 0),
                'card', COALESCE(SUM(CASE WHEN p.method = 'card' THEN p.amount ELSE 0 END), 0),
                'mobile', COALESCE(SUM(CASE WHEN p.method = 'mobile' THEN p.amount ELSE 0 END), 0)
            )
            FROM payments p
            JOIN orders o ON p.order_id = o.id
            WHERE o.branch_id = branch_id_param
            AND DATE(o.created_at) = report_date
        ),
        'tax_collected', COALESCE(SUM(o.tax), 0),
        'tips_total', COALESCE(SUM(p.tip), 0)
    ) INTO result
    FROM orders o
    WHERE o.branch_id = branch_id_param
    AND DATE(o.created_at) = report_date;

    RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kitchen orders
CREATE OR REPLACE FUNCTION kitchen_orders(branch_id_param UUID, status_filter VARCHAR DEFAULT 'pending')
RETURNS TABLE(
    order_id UUID,
    order_no VARCHAR,
    table_no VARCHAR,
    items JSONB,
    special_requests TEXT,
    created_at TIMESTAMPTZ,
    priority VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.order_no,
        rt.table_no,
        json_agg(
            json_build_object(
                'product_name', p.name,
                'quantity', oi.quantity,
                'modifiers', oi.modifiers,
                'notes', oi.notes,
                'status', oi.status
            )
        ) as items,
        o.special_requests,
        o.created_at,
        CASE
            WHEN o.created_at < NOW() - INTERVAL '30 minutes' THEN 'urgent'
            WHEN EXISTS(SELECT 1 FROM customers c WHERE c.id = o.customer_id AND c.loyalty_tier = 'Gold') THEN 'vip'
            ELSE 'normal'
        END as priority
    FROM orders o
    LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.branch_id = branch_id_param
    AND o.status = status_filter::order_status
    GROUP BY o.id, rt.table_no, o.special_requests, o.created_at
    ORDER BY o.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Popular items
CREATE OR REPLACE FUNCTION popular_items(branch_id_param UUID, start_date DATE, end_date DATE)
RETURNS TABLE(
    product_id UUID,
    product_name VARCHAR,
    quantity_sold DECIMAL,
    revenue DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        COALESCE(SUM(oi.quantity), 0),
        COALESCE(SUM(oi.subtotal), 0)
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    WHERE o.branch_id = branch_id_param
    AND DATE(o.created_at) BETWEEN start_date AND end_date
    AND o.status = 'completed'
    GROUP BY p.id, p.name
    ORDER BY quantity_sold DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inventory report
CREATE OR REPLACE FUNCTION inventory_report(branch_id_param UUID)
RETURNS TABLE(
    product_name VARCHAR,
    current_stock DECIMAL,
    min_stock DECIMAL,
    stock_value DECIMAL,
    days_of_supply INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.name,
        p.stock,
        p.min_stock,
        p.stock * p.cost,
        CASE
            WHEN p.stock <= 0 THEN 0
            ELSE GREATEST(1, ROUND(p.stock / NULLIF(
                (SELECT COALESCE(SUM(oi.quantity), 0) / 30.0, 1)
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE oi.product_id = p.id
                AND o.branch_id = branch_id_param
                AND o.created_at > NOW() - INTERVAL '30 days'
                AND o.status = 'completed'
            ), 0))
        END
    FROM products p
    WHERE p.branch_id = branch_id_param
    AND p.is_active = true
    ORDER BY p.stock ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- INITIAL DATA
-- ========================================

-- Insert default branch
INSERT INTO branches (id, name, address, phone, email, tax_rate, currency) VALUES
('00000000-0000-0000-0000-000000000001',
 'Main Restaurant',
 '123 Main Street, City, State 12345',
 '+1-555-0123',
 'info@restaurant.com',
 0.0800,
 'USD')
ON CONFLICT (id) DO NOTHING;

-- Insert default loyalty program
INSERT INTO loyalty_programs (id, name, description, points_per_dollar, tiers) VALUES
('00000000-0000-0000-0000-000000000001',
 'Restaurant Rewards',
 'Earn points with every purchase and unlock exclusive rewards',
 1.00,
 '[
    {"name": "Bronze", "min_points": 0, "discount_rate": 0.00},
    {"name": "Silver", "min_points": 500, "discount_rate": 0.05},
    {"name": "Gold", "min_points": 1500, "discount_rate": 0.10}
 ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert default categories
INSERT INTO categories (branch_id, name, description, display_order) VALUES
('00000000-0000-0000-0000-000000000001', 'Appetizers', 'Start your meal with our delicious appetizers', 1),
('00000000-0000-0000-0000-000000000001', 'Main Courses', 'Hearty and satisfying main dishes', 2),
('00000000-0000-0000-0000-000000000001', 'Desserts', 'Sweet endings to your meal', 3),
('00000000-0000-0000-0000-000000000001', 'Beverages', 'Refreshing drinks and beverages', 4)
ON CONFLICT DO NOTHING;

-- Insert sample users (passwords will be hashed by the application)
INSERT INTO users (id, email, password_hash, name, role, branch_id) VALUES
('10000000-0000-0000-0000-000000000001', 'owner@restaurant.com', 'hashed_password_here', 'Restaurant Owner', 'owner', '00000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000002', 'manager@restaurant.com', 'hashed_password_here', 'Restaurant Manager', 'manager', '00000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000003', 'cashier@restaurant.com', 'hashed_password_here', 'Cashier Staff', 'cashier', '00000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000004', 'kitchen@restaurant.com', 'hashed_password_here', 'Kitchen Staff', 'kitchen', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (email) DO NOTHING;