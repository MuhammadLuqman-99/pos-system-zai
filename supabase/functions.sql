-- ========================================
-- SUPABASE EDGE FUNCTIONS & WEBHOOKS
-- ========================================

-- Function to create activity log
CREATE OR REPLACE FUNCTION log_activity(
    user_id_param UUID,
    action_param VARCHAR,
    table_name_param VARCHAR,
    record_id_param UUID DEFAULT NULL,
    old_values_param JSONB DEFAULT NULL,
    new_values_param JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO activity_logs (
        user_id,
        branch_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent
    )
    SELECT
        user_id_param,
        u.branch_id,
        action_param,
        table_name_param,
        record_id_param,
        old_values_param,
        new_values_param,
        inet_client_addr(),
        current_setting('request.headers')::json->>'user-agent'
    FROM users u
    WHERE u.id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update stock on order completion
CREATE OR REPLACE FUNCTION update_stock_on_order_completion()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    -- Only update stock if order is being completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Create stock movements for each order item
        FOR item IN
            SELECT oi.product_id, oi.quantity, oi.order_id
            FROM order_items oi
            WHERE oi.order_id = NEW.id
        LOOP
            -- Update product stock
            UPDATE products
            SET stock = stock - item.quantity
            WHERE id = item.product_id;

            -- Create stock movement record
            INSERT INTO stock_movements (
                product_id,
                branch_id,
                type,
                quantity,
                reason,
                reference_id,
                reference_table,
                created_by
            )
            SELECT
                item.product_id,
                NEW.branch_id,
                'sale',
                -item.quantity,
                'Order #' || NEW.order_no,
                item.order_id,
                'orders',
                NEW.cashier_id;
        END LOOP;

        -- Log the activity
        PERFORM log_activity(
            NEW.cashier_id,
            'order_completed',
            'orders',
            NEW.id,
            row_to_json(OLD),
            row_to_json(NEW)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stock updates
CREATE TRIGGER update_stock_on_order_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_on_order_completion();

-- Function to handle customer loyalty points
CREATE OR REPLACE FUNCTION update_loyalty_points(
    customer_id_param UUID,
    points_to_add DECIMAL
)
RETURNS JSON AS $$
DECLARE
    current_points DECIMAL;
    current_tier VARCHAR;
    new_points DECIMAL;
    new_tier VARCHAR;
    loyalty_program_id UUID;
BEGIN
    -- Get current customer data
    SELECT
        c.points,
        c.loyalty_tier,
        c.loyalty_program_id
    INTO current_points, current_tier, loyalty_program_id
    FROM customers c
    WHERE c.id = customer_id_param;

    -- Update points
    new_points := current_points + points_to_add;

    -- Determine new tier
    IF loyalty_program_id IS NOT NULL THEN
        SELECT tiers->>0 INTO new_tier
        FROM loyalty_programs lp
        WHERE lp.id = loyalty_program_id
        AND lp.points_per_dollar > 0;

        -- Simple tier calculation (can be made more complex)
        IF new_points >= 1500 THEN
            new_tier := 'Gold';
        ELSIF new_points >= 500 THEN
            new_tier := 'Silver';
        ELSE
            new_tier := 'Bronze';
        END IF;

        -- Update customer
        UPDATE customers
        SET
            points = new_points,
            loyalty_tier = new_tier,
            visits = visits + 1
        WHERE id = customer_id_param;
    END IF;

    -- Return result
    RETURN json_build_object(
        'old_points', current_points,
        'new_points', new_points,
        'points_added', points_to_add,
        'old_tier', current_tier,
        'new_tier', new_tier
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate order number with prefix
CREATE OR REPLACE FUNCTION generate_order_number_with_prefix(prefix VARCHAR DEFAULT 'ORD')
RETURNS TEXT AS $$
DECLARE
    date_part TEXT;
    sequence_part TEXT;
BEGIN
    date_part := LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0') ||
                 LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0') ||
                 LPAD(EXTRACT(YEAR FROM NOW())::TEXT, 4, '0');

    sequence_part := LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');

    RETURN prefix || date_part || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Function to validate product stock before order
CREATE OR REPLACE FUNCTION validate_order_stock()
RETURNS TRIGGER AS $$
DECLARE
    insufficient_stock BOOLEAN := FALSE;
    item RECORD;
BEGIN
    -- Check if we're inserting new order items or updating quantities
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.quantity != OLD.quantity) THEN
        -- Check each item has sufficient stock
        FOR item IN
            SELECT p.id, p.stock, p.name, COALESCE(NEW.quantity, 0) as required_qty
            FROM products p
            WHERE p.id = NEW.product_id
        LOOP
            IF item.stock < item.required_qty THEN
                insufficient_stock := TRUE;
                RAISE EXCEPTION 'Insufficient stock for product: %. Available: %, Required: %',
                    item.name, item.stock, item.required_qty;
            END IF;
        END LOOP;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stock validation
CREATE TRIGGER validate_order_item_stock_trigger
    BEFORE INSERT OR UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION validate_order_stock();

-- Function to calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_totals()
RETURNS TRIGGER AS $$
DECLARE
    new_subtotal DECIMAL;
    new_tax DECIMAL;
    new_service_charge DECIMAL;
    new_total DECIMAL;
    branch_tax_rate DECIMAL;
    branch_service_rate DECIMAL;
BEGIN
    -- Get branch tax and service rates
    SELECT b.tax_rate, 0.10 -- Assuming 10% service charge, can be made configurable
    INTO branch_tax_rate, branch_service_rate
    FROM branches b
    WHERE b.id = NEW.branch_id;

    -- Calculate new subtotal from order items
    SELECT COALESCE(SUM(oi.subtotal), 0)
    INTO new_subtotal
    FROM order_items oi
    WHERE oi.order_id = NEW.id;

    -- Calculate tax and service charge
    new_tax := new_subtotal * COALESCE(branch_tax_rate, 0);
    new_service_charge := new_subtotal * COALESCE(branch_service_rate, 0);

    -- Calculate total
    new_total := new_subtotal + new_tax + new_service_charge - COALESCE(NEW.discount, 0);

    -- Update order totals
    NEW.subtotal := new_subtotal;
    NEW.tax := new_tax;
    NEW.service_charge := new_service_charge;
    NEW.total := new_total;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order total calculation
CREATE TRIGGER calculate_order_totals_trigger
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_totals();

-- Function to handle table status updates
CREATE OR REPLACE FUNCTION update_table_status_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- When order is created and assigned to table, mark table as occupied
    IF TG_OP = 'INSERT' AND NEW.table_id IS NOT NULL THEN
        UPDATE restaurant_tables
        SET status = 'occupied', updated_at = NOW()
        WHERE id = NEW.table_id;
    END IF;

    -- When order is completed and table was occupied, mark table for cleaning
    IF TG_OP = 'UPDATE'
        AND NEW.status = 'completed'
        AND OLD.status != 'completed'
        AND NEW.table_id IS NOT NULL
    THEN
        UPDATE restaurant_tables
        SET status = 'cleaning', updated_at = NOW()
        WHERE id = NEW.table_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for table status updates
CREATE TRIGGER update_table_status_on_order_trigger
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_table_status_on_order();

-- Function to get daily summary for dashboard
CREATE OR REPLACE FUNCTION get_daily_summary(branch_id_param UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_orders', COALESCE(COUNT(DISTINCT o.id), 0),
        'total_revenue', COALESCE(SUM(o.total), 0),
        'total_customers', COALESCE(COUNT(DISTINCT o.customer_id), 0),
        'active_tables', (
            SELECT COUNT(*)
            FROM restaurant_tables rt
            WHERE rt.branch_id = branch_id_param
            AND rt.status = 'occupied'
        ),
        'pending_orders', (
            SELECT COUNT(*)
            FROM orders o2
            WHERE o2.branch_id = branch_id_param
            AND o2.status IN ('pending', 'confirmed', 'preparing')
        ),
        'low_stock_items', (
            SELECT COUNT(*)
            FROM products p
            WHERE p.branch_id = branch_id_param
            AND p.stock <= p.min_stock
            AND p.is_active = true
        )
    ) INTO result
    FROM orders o
    WHERE o.branch_id = branch_id_param
    AND DATE(o.created_at) = CURRENT_DATE;

    RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get popular menu items
CREATE OR REPLACE FUNCTION get_popular_menu_items(branch_id_param UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    product_name VARCHAR,
    total_quantity DECIMAL,
    total_revenue DECIMAL,
    order_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.name,
        COALESCE(SUM(oi.quantity), 0),
        COALESCE(SUM(oi.subtotal), 0),
        COUNT(DISTINCT oi.order_id)
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    WHERE o.branch_id = branch_id_param
    AND o.status = 'completed'
    AND o.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY p.id, p.name
    ORDER BY total_quantity DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get staff performance
CREATE OR REPLACE FUNCTION get_staff_performance(branch_id_param UUID, start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days', end_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
    user_name VARCHAR,
    user_role user_role,
    orders_handled INTEGER,
    total_revenue DECIMAL,
    average_order_value DECIMAL,
    tips_total DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.name,
        u.role,
        COUNT(DISTINCT o.id),
        COALESCE(SUM(o.total), 0),
        COALESCE(AVG(o.total), 0),
        COALESCE(SUM(p.tip), 0)
    FROM users u
    LEFT JOIN orders o ON u.id = o.cashier_id
    LEFT JOIN payments p ON o.id = p.order_id
    WHERE u.branch_id = branch_id_param
    AND u.is_active = true
    AND u.role IN ('cashier', 'waitstaff')
    AND (o.created_at IS NULL OR (DATE(o.created_at) BETWEEN start_date AND end_date))
    GROUP BY u.id, u.name, u.role
    ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;