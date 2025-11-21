# 🗄️ Database Schema Documentation

Complete database schema documentation for the Restaurant POS System.

## Table of Contents

- [Database Overview](#database-overview)
- [Table Relationships](#table-relationships)
- [Table Definitions](#table-definitions)
- [Indexes and Performance](#indexes-and-performance)
- [Data Types](#data-types)
- [Security Rules](#security-rules)
- [Migrations](#migrations)
- [Backup and Recovery](#backup-and-recovery)

---

## Database Overview

### Database Type: PostgreSQL (via Supabase)
- **Version**: PostgreSQL 15+
- **Character Set**: UTF8
- **Collation**: en_US.UTF-8
- **Timezone**: UTC with application-level conversion

### Design Principles
- **Relational**: Normalized structure with proper relationships
- **Scalable**: Designed for high transaction volumes
- **Secure**: Row-level security for multi-tenant architecture
- **Auditable**: Complete audit trail of all changes
- **Performant**: Optimized indexes and queries

---

## Table Relationships (ERD)

```sql
┌───────────────────┐         ┌───────────────────┐         ┌───────────────────┐
│      branches     │         │       users       │         │   loyalty_programs│
│-------------------│         │-------------------│         │-------------------│
│ id (PK)           │         │ id (PK)           │         │ id (PK)           │
│ name              │         │ email (UNIQUE)    │         │ name              │
│ address           │◄────────┼│ name              │◄────────┼│ description       │
│ phone             │         │ role (ENUM)       │         │ points_per_dollar  │
│ tax_rate          │         │ branch_id (FK)    │         │ tiers             │
│ currency          │         │ created_at        │         │ is_active         │
│ timezone          │         │ updated_at        │         │ created_at        │
│ created_at        │         │ last_login        │         │ updated_at        │
│ updated_at        │         │ is_active         │         │                   │
└───────────────────┘         └───────────────────┘         └───────────────────┘
         │                           │                         │
         │                   ┌───┼─────────────────┐      ┌─────────┐
         │                   │   users   │ categories │      │customers│
         │                   │ (branch) │  (branch)  │      │(program)│
         │                   └───┼─────────────────┘      └─────────┘
         │                           │                         │
         │                 ┌─────────┬─────────┬─────────┐
         │                 │products │   orders │  payments│
         │                 │(branch) │ (branch) │ (order)  │
         │                 └─────────┴─────────┴─────────┘
```

---

## Table Definitions

### Core Tables

#### 1. Branches
Multi-branch restaurant locations
```sql
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

**Fields:**
- `id`: Unique identifier
- `name`: Branch name (e.g., "Main Restaurant")
- `address`: Physical address
- `phone`: Contact phone number
- `email`: Contact email
- `tax_rate`: Default tax rate (e.g., 0.0800 for 8%)
- `currency`: Default currency code (ISO 4217)
- `timezone`: Branch timezone (e.g., 'America/New_York')
- `settings`: JSON configuration for branch-specific settings
- `created_at`: Record creation timestamp
- `updated_at`: Record update timestamp

#### 2. Users
System users with role-based access
```sql
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'cashier', 'kitchen', 'waitstaff');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

**Fields:**
- `id`: Unique user identifier
- `email`: User email (unique)
- `password_hash`: Encrypted password
- `name`: User's full name
- `role`: User role (owner, manager, cashier, kitchen, waitstaff)
- `branch_id`: Assigned branch (NULL for owners)
- `phone`: Contact phone
- `avatar_url`: Profile picture URL
- `is_active`: Account status
- `created_at`: Account creation timestamp
- `updated_at`: Account update timestamp
- `last_login`: Last login timestamp

**Roles:**
- `owner`: Full system access, all branches
- `manager`: Branch management, products, reports
- `cashier`: Order processing, payments, customer service
- `kitchen`: Order viewing, kitchen display, inventory updates
- `waitstaff`: Table management, order taking

#### 3. Categories
Menu categories for organizing products
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    branch_id UUID REFERENCES branches(id),
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique identifier
- `name`: Category name (e.g., "Appetizers")
- `description`: Category description
- `branch_id`: Branch ownership (NULL for shared categories)
- `image_url`: Category image
- `display_order`: Sort order in POS
- `is_active`: Category visibility status
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

#### 4. Products
Restaurant menu items and inventory
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

**Fields:**
- `id`: Unique identifier
- `name`: Product name (e.g., "Burger Deluxe")
- `description`: Product description
- `sku`: Stock keeping unit
- `barcode`: Barcode for scanning
- `price`: Selling price
- `cost`: Cost price
- `stock`: Current inventory quantity
- `min_stock`: Minimum stock alert level
- `category_id`: Category reference
- `branch_id`: Branch ownership
- `tax_rate`: Tax rate override
- `image_url`: Product image
- `ingredients`: Recipe ingredients (JSON array)
- `allergens`: Allergen information (JSON array)
- `preparation_time`: Preparation time in minutes
- `is_active`: Product visibility status
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

---

### Restaurant-Specific Tables

#### 5. Restaurant Tables
Dining table management
```sql
CREATE TYPE table_status AS ENUM ('available', 'occupied', 'reserved', 'cleaning');

CREATE TABLE restaurant_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_no VARCHAR(10) NOT NULL,
    capacity INTEGER NOT NULL,
    status table_status DEFAULT 'available',
    branch_id UUID REFERENCES branches(id),
    location VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(branch_id, table_no)
);
```

**Fields:**
- `id`: Unique identifier
- `table_no`: Table number (e.g., "T1")
- `capacity`: Seating capacity
- `status`: Current table status
- `branch_id`: Branch ownership
- `location`: Physical location (e.g., "indoor", "patio")
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

**Status Values:**
- `available`: Clean and ready for seating
- `occupied`: Currently occupied by customers
- `reserved`: Reserved for future booking
- `cleaning`: Needs cleaning

#### 6. Loyalty Programs
Customer rewards programs
```sql
CREATE TABLE loyalty_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    points_per_dollar DECIMAL(5,2) DEFAULT 1.00,
    tiers JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tiers Structure:**
```json
[
    {
        "name": "Bronze",
        "min_points": 0,
        "discount_rate": 0.0000
    },
    {
        "name": "Silver",
        "min_points": 500,
        "discount_rate": 0.0500
    },
    {
        "name": "Gold",
        "min_points": 1500,
        "discount_rate": 0.1000
    }
]
```

#### 7. Customers
Customer information and loyalty data
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

**Fields:**
- `id`: Unique identifier
- `phone`: Phone number (unique)
- `email`: Email address
- `name`: Customer name
- `branch_id`: Primary branch
- `loyalty_program_id`: Associated loyalty program
- `loyalty_tier`: Current loyalty tier
- `points`: Current loyalty points
- `total_spent`: Total amount spent
- `visits`: Number of visits
- `birth_date`: Birth date
- `address`: Physical address
- `notes`: Special notes
- `is_active`: Account status
- `created_at`: Account creation
- `updated_at`: Account update

---

### Transaction Tables

#### 8. Orders
Customer orders and transactions
```sql
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled');
CREATE TYPE order_type AS ENUM ('dine_in', 'takeaway', 'delivery');
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid', 'refunded', 'voided');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

**Fields:**
- `id`: Unique identifier
- `order_no`: Human-readable order number
- `branch_id`: Branch where order was placed
- `table_id`: Assigned table
- `customer_id`: Customer reference
- `cashier_id`: Staff who processed order
- `status`: Order status
- `order_type`: Order type
- `subtotal`: Subtotal before tax and service charge
- `discount`: Applied discount
- `tax`: Tax amount
- `service_charge`: Service charge amount
- `total`: Final total
- `payment_status`: Payment status
- `special_requests`: Customer notes
- `estimated_time`: Estimated preparation time
- `actual_time`: Actual preparation time
- `created_at`: Order creation timestamp
- `updated_at`: Last update timestamp

#### 9. Order Items
Line items within orders
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

**Modifiers Structure:**
```json
[
    {
        "name": "Extra Cheese",
        "price": 1.50,
        "category": "addition"
    },
    {
        "name": "No Onions",
        "price": 0.00,
        "category": "removal"
    }
]
```

**Fields:**
- `id`: Unique identifier
- `order_id`: Reference to orders table
- `product_id`: Reference to products table
- `quantity`: Quantity ordered
- `unit_price`: Price per unit
- `subtotal`: Total for this item
- `modifiers`: Product modifications (JSON)
- `notes`: Special preparation notes
- `status`: Item status (pending, preparing, ready)
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

#### 10. Table Orders
Table assignment tracking
```sql
CREATE TABLE table_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

#### 11. Payments
Payment transactions
```sql
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'mobile', 'voucher', 'loyalty_points');

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

---

### Inventory Tables

#### 12. Stock Movements
Inventory tracking and adjustments
```sql
CREATE TYPE movement_type AS ENUM ('purchase', 'sale', 'adjustment', 'waste', 'transfer', 'return');

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

#### 13. Activity Logs
Audit trail for system changes
```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

---

## Indexes and Performance

### Primary Indexes
All tables have primary key indexes by default.

### Foreign Key Indexes
```sql
-- Category indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_branch_id ON products(branch_id);

-- User indexes
CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_users_email ON users(email);

-- Order indexes
CREATE INDEX idx_orders_branch_id ON orders(branch_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_table_id ON orders(table_id);

-- Order item indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Stock movement indexes
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_branch_id ON stock_movements(branch_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);

-- Customer indexes
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_branch_id ON customers(branch_id);

-- Activity log indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_branch_id ON activity_logs(branch_id);

-- Table management indexes
CREATE INDEX idx_restaurant_tables_branch_id ON restaurant_tables(branch_id);
CREATE INDEX idx_restaurant_tables_status ON restaurant_tables(status);
```

### Composite Indexes for Performance
```sql
-- For finding products in a specific category and branch
CREATE INDEX idx_products_branch_category ON products(branch_id, category_id);

-- For finding orders by status and date range
CREATE INDEX idx_orders_status_date ON orders(status, created_at);

-- For finding recent table orders
CREATE INDEX idx_table_orders_table_date ON table_orders(table_id, assigned_at DESC);

-- For audit trail filtering
CREATE INDEX idx_activity_logs_date_user ON activity_logs(created_at DESC, user_id);
```

### Full-Text Search Indexes
```sql
-- Enable full-text search for products
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create text search configuration
CREATE TEXT SEARCH CONFIGURATION english (STEMMERGER = english_stemmer);

-- Create full-text search index
ALTER TABLE products ADD COLUMN search_vector tsvector;

-- Update search vector
UPDATE products
SET search_vector = to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''));

-- Create GIN index for search
CREATE INDEX idx_products_search_vector ON products USING GIN(search_vector);

-- Search function
CREATE OR REPLACE FUNCTION search_products(query text)
RETURNS TABLE AS $$
BEGIN
    RETURN QUERY
        SELECT *,
                ts_rank(search_vector, plainto_tsquery(query)) as rank
        FROM products
        WHERE search_vector @@ plainto_tsquery(query)
        AND is_active = true
        ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;
```

---

## Data Types

### Enums
```sql
-- User roles
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'cashier', 'kitchen', 'waitstaff');

-- Order status
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled');

-- Order type
CREATE TYPE order_type AS ENUM ('dine_in', 'takeaway', 'delivery');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid', 'refunded', 'voided');

-- Payment method
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'mobile', 'voucher', 'loyalty_points');

-- Table status
CREATE TYPE table_status AS ENUM ('table_available', 'table_occupied', 'table_reserved', 'table_cleaning');

-- Stock movement type
CREATE TYPE movement_type AS ENUM ('purchase', 'sale', 'adjustment', 'waste', 'transfer', 'return');
```

### JSONB Columns
```sql
-- Product ingredients (JSON array)
CREATE TABLE products (
    -- ... other columns
    ingredients JSONB DEFAULT '[]'::jsonb,
    -- Example: ['beef_patty', 'cheese', 'lettuce', 'tomato', 'bun']
    allergens JSONB DEFAULT '[]'::jsonb
    -- Example: ['dairy', 'gluten']
);

-- Order modifiers (JSON array)
CREATE TABLE order_items (
    -- ... other columns
    modifiers JSONB DEFAULT '[]'::jsonb
    -- Example: [
    --   { name: 'Extra Cheese', price: 1.50, category: 'addition' },
    --   { name: 'No Pickles', price: 0.00, category: 'removal' }
    -- ]
);

-- Branch settings (JSON object)
CREATE TABLE branches (
    -- ... other columns
    settings JSONB DEFAULT '{}'
    -- Example: {
    --   "receipt_header": "Restaurant Name",
    --   "kitchen_display": true,
    --   "auto_print_receipts": false
    -- }
);

-- Loyalty program tiers (JSON array)
CREATE TABLE loyalty_programs (
    -- ... other columns
    tiers JSONB DEFAULT '[]'::jsonb
    -- Example: [
    --   { "name": "Bronze", "min_points": 0, "discount_rate": 0.0000 },
    --   { "name": "Silver", "min_points": 500, "discount_rate": 0.0500 },
    --   { "name": "Gold", "min_points": 1500, "discount_rate": 0.1000 }
    -- ]
);
```

---

## Security Rules

### Row Level Security (RLS)

#### Branch Isolation
```sql
-- Users can only access data from their branch (except owners)
CREATE POLICY "Users can only access their branch data"
ON users
FOR ALL
USING (
  auth.role() = 'authenticated'
  AND (
    -- Owners can access all branches
    (SELECT role FROM users WHERE id = auth.uid()) = 'owner'
    -- Others can only access their assigned branch
    OR branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
  )
);
```

#### Customer Data Protection
```sql
-- Only staff can view customer data in their branch
CREATE POLICY "Staff can view customers in their branch"
ON customers
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('owner', 'manager', 'cashier', 'waitstaff')
    OR (
      (SELECT role FROM users WHERE id = auth.uid()) = 'kitchen'
      AND customers.id IN (
        SELECT customer_id FROM orders WHERE orders.branch_id = (
          SELECT branch_id FROM users WHERE id = auth.uid()
        )
      )
    )
  )
);
```

#### Financial Data Protection
```sql
-- Only managers and owners can access financial data
CREATE POLICY "Protect financial data"
ON orders
FOR ALL
USING (
  auth.role() = 'authenticated'
  AND (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('owner', 'manager')
    OR (
      (SELECT role FROM users WHERE id = auth.uid()) = 'cashier'
      AND orders.cashier_id = auth.uid()
    )
  )
);
```

---

## Migrations

### Migration Versioning
```sql
-- Migration version tracking
CREATE TABLE schema_migrations (
    version VARCHAR(20) PRIMARY KEY,
    description TEXT NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    checksum TEXT NOT NULL
);

-- Example migration function
CREATE OR REPLACE FUNCTION run_migration(p_version VARCHAR(20))
RETURNS TEXT AS $$
DECLARE
    v_description TEXT;
    v_sql TEXT;
BEGIN
    -- Get migration SQL
    SELECT description, sql INTO v_description, v_sql
    FROM migration_scripts
    WHERE version = p_version;

    -- Execute migration
    BEGIN;
        EXECUTE v_sql;
    EXCEPTION WHEN OTHERS THEN
        RETURN 'Error: ' || SQLERRM;
    END;
    COMMIT;

    -- Record migration
    INSERT INTO schema_migrations (version, description, executed_at, checksum)
    VALUES (p_version, v_description, NOW(), md5(v_sql));

    RETURN 'Success: ' || v_description;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Backup and Recovery

### Automated Backup Strategy
```sql
-- Create backup function
CREATE OR REPLACE FUNCTION create_backup(p_description TEXT)
RETURNS TEXT AS $$
DECLARE
    v_backup_name TEXT;
    v_file_path TEXT;
BEGIN
    -- Generate backup filename
    v_backup_name := 'backup_' || TO_CHAR(NOW(), 'YYYY_MM_DD_HH24MISS') || '.sql';

    -- Export schema and data
    v_file_path := '/backups/' || v_backup_name;

    -- Implementation depends on your backup system
    -- This would typically involve pg_dump or similar tools
    PERFORM dblink_connect('backup_server', 'conn_backup');

    -- Create backup
    PERFORM dblink_exec('conn_backup',
        'CREATE TABLE backup_' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') ||
        ' AS SELECT * FROM ' || CURRENT_DATABASE()
    );

    -- Return success
    RETURN 'Backup created: ' || v_backup_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Data Recovery Procedures
```sql
-- Data restoration function
CREATE OR REPLACE FUNCTION restore_backup(p_backup_name TEXT)
RETURNS TEXT AS $$
DECLARE
    v_file_path TEXT;
BEGIN
    v_file_path := '/backups/' || p_backup_name;

    -- Implementation depends on your backup system
    PERFORM dblink_connect('backup_server', 'conn_backup');

    -- Drop existing tables (be careful in production!)
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS order_items CASCADE;
    -- ... drop other tables

    -- Restore from backup
    PERFORM dblink_exec('conn_backup',
        'INSERT INTO ' || CURRENT_DATABASE() || ' || p_backup_name ||
        ' SELECT * FROM backup_' || p_backup_name
    );

    -- Recreate indexes and constraints
    PERFORM dblink_exec('conn_backup', 'SELECT recreate_indexes()');

    return 'Backup restored: ' || p_backup_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Point-in-Time Recovery (PITR)
```sql
-- Create point-in-time recovery function
CREATE OR REPLACE FUNCTION create_pitr()
RETURNS TEXT AS $$
DECLARE
    v_pitr_name TEXT;
BEGIN
    -- Generate PITR name
    v_pitr_name := 'pitr_' || TO_CHAR(NOW(), 'YYYY_MM_DD_HH24MISS');

    -- Create point-in-time recovery point
    PERFORM pg_create_point(v_pitr_name);

    RETURN 'Point-in-time recovery created: ' || v_pitr_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restore from point-in-time
CREATE OR REPLACE FUNCTION restore_from_pitr(p_pitr_name TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Rollback to point-in-time
    PERFORM pg_rollback_to(v_pitr_name);

    RETURN 'Restored from point-in-time: ' || v_pitr_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Data Archiving
```sql
-- Archive old orders function
CREATE OR REPLACE FUNCTION archive_old_days(p_days INTEGER)
RETURNS TEXT AS $$
DECLARE
    v_archive_date DATE;
    v_moved_count INTEGER;
BEGIN
    -- Calculate archive date
    v_archive_date := CURRENT_DATE - INTERVAL '1 day' * p_days;

    -- Archive old orders
    INSERT INTO orders_archive
    SELECT * FROM orders
    WHERE created_at < v_archive_date;

    v_moved_count := ROW_COUNT;

    -- Delete from main table
    DELETE FROM orders
    WHERE created_at < v_archive_date;

    RETURN 'Archived ' || v_moved_count || ' orders from ' || v_archive_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Performance Optimization

### Query Optimization
```sql
-- Analyze slow queries
SELECT
    query,
    calls,
    total_time,
    mean_time,
    std_dev_time
FROM pg_stat_statements('pg_stat_statements')
WHERE query LIKE '%orders%'
ORDER BY total_time DESC
LIMIT 10;

-- Create optimized view for dashboard data
CREATE OR REPLACE VIEW dashboard_summary AS
WITH recent_sales AS (
    SELECT
        COUNT(*) as order_count,
        SUM(total) as total_sales,
        AVG(total) as average_order,
        DATE(created_at) as order_date
    FROM orders
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at)
),
    popular_items AS (
        SELECT
            p.name,
            SUM(oi.quantity) as total_quantity,
            SUM(oi.subtotal) as total_revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        WHERE o.status = 'completed'
        AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY p.id, p.name
        ORDER BY total_quantity DESC
        LIMIT 10
    )
SELECT
    jsonb_build_object(
        'sales_summary', jsonb_agg(
            jsonb_build_object(
                'date', order_date,
                'order_count', order_count,
                'total_sales', total_sales,
                'average_order', average_order
            )
        )
    ),
        'popular_items', jsonb_agg(
            jsonb_build_object(
                'name', name,
                'quantity', total_quantity,
                'revenue', total_revenue
            )
        )
    )
FROM recent_sales, popular_items;
```

### Partitioning for Large Tables
```sql
-- Partition orders table by date for large datasets
CREATE TABLE orders (
    -- ... other columns
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create partitions
CREATE TABLE orders_2024_01 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE orders_2024_02 PARTITION OF orders
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Automate partition management
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS TEXT AS
DECLARE
    v_partition_name TEXT;
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    -- Calculate partition name and dates
    v_partition_name := 'orders_' || TO_CHAR(DATE_TRUNC(CURRENT_DATE, 'MONTH'), 'YYYY_MM');
    v_start_date := DATE_TRUNC(CURRENT_DATE, 'MONTH');
    v_end_date = v_start_date + INTERVAL '1 month';

    -- Create partition
    EXECUTE format('CREATE TABLE %I PARTITION OF orders
        FOR VALUES FROM (%L) TO (%L);',
        v_partition_name,
        TO_CHAR(v_start_date, 'YYYY-MM-DD'),
        TO_CHAR(v_end_date, 'YYYY-MM-DD')
    );

    RETURN 'Created partition: ' || v_partition_name;
END;
$$ LANGUAGE plpgsql;

-- Schedule partition creation
SELECT cron.schedule(
    'create-monthly-partition',
    '0 0 1 * *', -- 1st of each month at midnight
    'CREATE OR REPLACE FUNCTION create_monthly_partition(); SELECT 1'
);
```

This comprehensive database schema documentation provides complete information about the Restaurant POS System's database structure, relationships, and optimization strategies. The schema is designed for performance, security, and scalability in a multi-tenant restaurant environment.