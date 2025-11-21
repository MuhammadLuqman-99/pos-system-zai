-- ========================================
-- SAMPLE DATA FOR DEMONSTRATION
-- ========================================

-- Insert sample restaurant tables
INSERT INTO restaurant_tables (branch_id, table_no, capacity, location, status) VALUES
('00000000-0000-0000-0000-000000000001', 'T1', 4, 'indoor', 'available'),
('00000000-0000-0000-0000-000000000001', 'T2', 2, 'indoor', 'available'),
('00000000-0000-0000-0000-000000000001', 'T3', 6, 'indoor', 'occupied'),
('00000000-0000-0000-0000-000000000001', 'T4', 4, 'indoor', 'available'),
('00000000-0000-0000-0000-000000000001', 'T5', 4, 'outdoor', 'occupied'),
('00000000-0000-0000-0000-000000000001', 'T6', 8, 'outdoor', 'available'),
('00000000-0000-0000-0000-000000000001', 'T7', 2, 'indoor', 'reserved'),
('00000000-0000-0000-0000-000000000001', 'T8', 4, 'indoor', 'cleaning')
ON CONFLICT (branch_id, table_no) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, sku, barcode, price, cost, stock, min_stock, category_id, branch_id, tax_rate, preparation_time, is_active) VALUES
-- Appetizers
('Burger Deluxe', 'Juicy beef patty with lettuce, tomato, onion, and special sauce', 'BURG001', '1234567890123', 12.99, 5.50, 45, 10, (SELECT id FROM categories WHERE name = 'Appetizers' LIMIT 1), '00000000-0000-0000-0000-000000000001', 0.0800, 15, true),
('Caesar Salad', 'Fresh romaine lettuce with parmesan cheese and croutons', 'SALAD001', '1234567890124', 8.99, 3.25, 28, 10, (SELECT id FROM categories WHERE name = 'Appetizers' LIMIT 1), '00000000-0000-0000-0000-000000000001', 0.0800, 10, true),
('Chicken Wings', 'Crispy chicken wings with your choice of sauce', 'WINGS001', '1234567890125', 10.99, 4.75, 35, 15, (SELECT id FROM categories WHERE name = 'Appetizers' LIMIT 1), '00000000-0000-0000-0000-000000000001', 0.0800, 20, true),

-- Main Courses
('Pizza Margherita', 'Classic pizza with fresh mozzarella, tomatoes, and basil', 'PIZZA001', '1234567890126', 15.99, 6.50, 32, 10, (SELECT id FROM categories WHERE name = 'Main Courses' LIMIT 1), '00000000-0000-0000-0000-000000000001', 0.0800, 25, true),
('Grilled Salmon', 'Fresh Atlantic salmon with herbs and lemon', 'SALMON001', '1234567890127', 22.99, 12.00, 18, 8, (SELECT id FROM categories WHERE name = 'Main Courses' LIMIT 1), '00000000-0000-0000-0000-000000000001', 0.0800, 30, true),
('Steak Frites', 'Grilled ribeye steak with french fries', 'STEAK001', '1234567890128', 28.99, 15.50, 12, 6, (SELECT id FROM categories WHERE name = 'Main Courses' LIMIT 1), '00000000-0000-0000-0000-000000000001', 0.0800, 35, true),
('Pasta Carbonara', 'Creamy pasta with bacon, eggs, and parmesan', 'PASTA001', '1234567890129', 14.99, 6.25, 25, 10, (SELECT id FROM categories WHERE name = 'Main Courses' LIMIT 1), '00000000-0000-0000-0000-000000000001', 0.0800, 20, true),

-- Desserts
('Chocolate Cake', 'Rich chocolate cake with vanilla frosting', 'CAKE001', '1234567890130', 6.99, 2.50, 20, 8, (SELECT id FROM categories WHERE name = 'Desserts' LIMIT 1), '00000000-0000-0000-0000-000000000001', 0.0800, 5, true),
('Ice Cream Sundae', 'Vanilla ice cream with chocolate sauce and whipped cream', 'SUNDAE001', '1234567890131', 4.99, 1.75, 40, 15, (SELECT id FROM categories WHERE name = 'Desserts' LIMIT 1), '00000000-0000-0000-0000-000000000001', 0.0800, 3, true),
('Cheesecake', 'New York style cheesecake with berry compote', 'CHEESE001', '1234567890132', 7.99, 3.00, 15, 6, (SELECT id FROM categories WHERE name = 'Desserts' LIMIT 1), '00000000-0000-0000-0000-000000000001', 0.0800, 5, true),

-- Beverages
('Craft Beer', 'Local craft beer selection', 'BEER001', '1234567890133', 4.50, 2.00, 80, 20, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), '00000000-0000-0000-0000-000000000001', 0.0800, 2, true),
('Fresh Lemonade', 'Freshly squeezed lemonade', 'LEMON001', '1234567890134', 3.50, 1.00, 100, 25, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), '00000000-0000-0000-0000-000000000001', 0.0800, 3, true),
('Coffee', 'Freshly brewed coffee', 'COFFEE001', '1234567890135', 2.99, 0.75, 200, 50, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), '00000000-0000-0000-0000-000000000001', 0.0800, 5, true),
('Soft Drink', 'Assorted soft drinks (Coke, Sprite, etc.)', 'SOFT001', '1234567890136', 2.50, 0.85, 150, 30, (SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), '00000000-0000-0000-0000-000000000001', 0.0800, 2, true)
ON CONFLICT (sku) DO NOTHING;

-- Insert sample customers
INSERT INTO customers (phone, email, name, branch_id, loyalty_program_id, loyalty_tier, points, total_spent, visits, birth_date) VALUES
('5550123456', 'john.doe@email.com', 'John Doe', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Gold', 2100.00, 850.50, 45, '1985-06-15'),
('5550234567', 'jane.smith@email.com', 'Jane Smith', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Silver', 750.00, 320.25, 22, '1990-09-22'),
('5550345678', 'bob.johnson@email.com', 'Bob Johnson', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Bronze', 250.00, 125.75, 8, '1988-03-10'),
('5550456789', 'sarah.wilson@email.com', 'Sarah Wilson', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Silver', 680.00, 290.80, 18, '1992-12-05'),
('5550567890', 'mike.brown@email.com', 'Mike Brown', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Gold', 1800.00, 720.90, 38, '1987-08-18')
ON CONFLICT (phone) DO NOTHING;

-- Insert sample orders (for demonstration)
-- Note: In a real application, these would be created through the app

-- Sample order 1
DO $$
DECLARE
    order_uuid UUID := uuid_generate_v4();
    order_item_uuid1 UUID := uuid_generate_v4();
    order_item_uuid2 UUID := uuid_generate_v4();
    payment_uuid UUID := uuid_generate_v4();
    table_order_uuid UUID := uuid_generate_v4();
BEGIN
    -- Create order
    INSERT INTO orders (id, order_no, branch_id, table_id, customer_id, cashier_id, status, order_type, subtotal, discount, tax, service_charge, total, payment_status, special_requests)
    VALUES (order_uuid, 'ORD20240101001', '00000000-0000-0000-0000-000000000001',
            (SELECT id FROM restaurant_tables WHERE table_no = 'T3' AND branch_id = '00000000-0000-0000-0000-000000000001'),
            (SELECT id FROM customers WHERE phone = '5550123456'),
            '10000000-0000-0000-0000-000000000003', -- cashier user
            'completed', 'dine_in', 28.98, 0.00, 2.32, 2.90, 34.20, 'paid', 'Extra napkins please');

    -- Create order items
    INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal, modifiers, notes, status)
    VALUES
    (order_item_uuid1, order_uuid, (SELECT id FROM products WHERE sku = 'BURG001'), 2, 12.99, 25.98,
     '[{"name": "Extra Cheese", "price": 1.50}]'::jsonb, 'Well done', 'completed'),
    (order_item_uuid2, order_uuid, (SELECT id FROM products WHERE sku = 'BEER001'), 1, 4.50, 3.00,
     '[]'::jsonb, '', 'completed');

    -- Create payment
    INSERT INTO payments (id, order_id, amount, method, status, card_last4, tip, cash_received, change_given)
    VALUES (payment_uuid, order_uuid, 35.20, 'card', 'completed', '1234', 2.00, 0.00, 0.00);

    -- Create table order
    INSERT INTO table_orders (id, order_id, table_id, customer_id, status, seated_at, completed_at, waiter_id)
    VALUES (table_order_uuid, order_uuid, (SELECT id FROM restaurant_tables WHERE table_no = 'T3' AND branch_id = '00000000-0000-0000-0000-000000000001'),
            (SELECT id FROM customers WHERE phone = '5550123456'), 'completed',
            NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 minutes',
            '10000000-0000-0000-0000-000000000003'); -- cashier user

    -- Update table status back to available
    UPDATE restaurant_tables
    SET status = 'available'
    WHERE table_no = 'T3' AND branch_id = '00000000-0000-0000-0000-000000000001';
END $$;

-- Sample stock movements
INSERT INTO stock_movements (product_id, branch_id, type, quantity, reason, created_by)
VALUES
-- Purchases
((SELECT id FROM products WHERE sku = 'BURG001'), '00000000-0000-0000-0000-000000000001', 'purchase', 100, 'Initial stock', '10000000-0000-0000-0000-000000000002'),
((SELECT id FROM products WHERE sku = 'PIZZA001'), '00000000-0000-0000-0000-000000000001', 'purchase', 50, 'Initial stock', '10000000-0000-0000-0000-000000000002'),
((SELECT id FROM products WHERE sku = 'BEER001'), '00000000-0000-0000-0000-000000000001', 'purchase', 200, 'Initial stock', '10000000-0000-0000-0000-000000000002'),

-- Waste/Adjustments
((SELECT id FROM products WHERE sku = 'WINGS001'), '00000000-0000-0000-0000-000000000001', 'waste', 5, 'Spoiled items', '10000000-0000-0000-0000-000000000004'),
((SELECT id FROM products WHERE sku = 'SALAD001'), '00000000-0000-0000-0000-000000000001', 'adjustment', -2, 'Inventory correction', '10000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- Sample activity logs for demonstration
INSERT INTO activity_logs (user_id, branch_id, action, table_name, record_id, new_values)
VALUES
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'order_created', 'orders', (SELECT id FROM orders WHERE order_no = 'ORD20240101001'),
 '{"status": "pending", "order_type": "dine_in"}'::jsonb),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'payment_processed', 'payments',
 (SELECT id FROM payments WHERE order_id = (SELECT id FROM orders WHERE order_no = 'ORD20240101001')),
 '{"amount": 35.20, "method": "card"}'::jsonb)
ON CONFLICT DO NOTHING;