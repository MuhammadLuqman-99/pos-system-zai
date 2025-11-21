# 📖 User Guide

Complete user manual for the Restaurant POS System.

## Table of Contents

- [Getting Started](#getting-started)
- [Login & Authentication](#login--authentication)
- [POS Terminal](#pos-terminal)
- [Table Management](#table-management)
- [Kitchen Display System](#kitchen-display-system)
- [Product Management](#product-management)
- [Customer Management](#customer-management)
- [Reports & Analytics](#reports--analytics)
- [Settings & Configuration](#settings--configuration)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection
- Device with screen resolution 1024x768 or higher
- For mobile/tablet: iOS 12+ or Android 8+

### First Time Login
1. Open the POS URL in your browser
2. Enter your email and password provided by your manager
3. Select your restaurant branch if applicable
4. Click "Sign In"

### Dashboard Overview
Once logged in, you'll see:
- **Top Navigation**: Main menu items based on your role
- **Quick Stats**: Today's sales and order count (managers+)
- **Quick Actions**: Common tasks for your role
- **Current Status**: Your assigned tasks and notifications

---

## Login & Authentication

### Staff Login
1. **Email**: Enter your restaurant email
2. **Password**: Your secure password
3. **Branch**: Select your location (multi-branch restaurants)
4. **Remember Me**: Keep logged in (shared devices should NOT use this)

### Demo Accounts
For training purposes:
- **Owner**: owner@restaurant.com / password123
- **Manager**: manager@restaurant.com / password123
- **Cashier**: cashier@restaurant.com / password123
- **Kitchen**: kitchen@restaurant.com / password123

### Security Features
- **Session Timeout**: Automatically logs out after inactivity
- **Role-Based Access**: Only see features relevant to your role
- **Secure Passwords**: Enforced complexity requirements

---

## POS Terminal

### Main Interface Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [🍔 Restaurant POS] [Table: T5] [User: John] [⚙️] [👤]      │
├─────────────────────────────────────────────────────────────┤
│ CATEGORIES          │            PRODUCT LIST               │
│ ┌─────────────┐     │ ┌─────────────────────────────────────┐ │
│ │ Appetizers  │     │ │ 🍔 Burger Deluxe      $12.99   [+] │ │
│ │ Mains       │     │ │ 🍕 Pizza Margherita $15.99   [+] │ │
│ │ Desserts    │     │ │ 🥗 Caesar Salad      $8.99    [+] │ │
│ │ Beverages   │     │ │ 🍺 Beer (330ml)     $4.50    [+] │ │
│ │ [Search...] │     │ │                                     │ │
│ └─────────────┘     │ │ 📊 Search products...              │ │
│                     │ └─────────────────────────────────────┘ │
│ BROWSER SCAN: [📷] │                                     │
│                     │           ORDER DETAILS               │
│                     │ ┌─────────────────────────────────────┐ │
│                     │ │ Table: T5 | Customers: 4           │ │
│                     │ ├─────────────────────────────────────┤ │
│                     │ │ Burger Deluxe x2       $25.98      │ │
│                     │ │   - Extra Cheese      +$3.00      │ │
│                     │ │ Pizza Margherita x1   $15.99      │ │
│                     │ │ Beer x4                $18.00      │ │
│                     │ ├─────────────────────────────────────┤ │
│                     │ │ Subtotal:              $62.97      │ │
│                     │ │ Tax (8%):              $5.04       │ │
│                     │ │ Service:               $6.30       │ │
│                     │ │ Total:                 $74.31      │ │
│                     │ ├─────────────────────────────────────┤ │
│                     │ │ Discount: [0% ▼]  [$0.00]         │ │
│                     │ │ Customer: [Select...]             │ │
│                     │ └─────────────────────────────────────┘ │
│                     │                                     │ │
│                     │ [💳 PAYMENT] [🖨️ PRINT] [✅ SAVE]     │ │
└─────────────────────────────────────────────────────────────┘
```

### Taking an Order

#### 1. Select Customer/Table
- **Table Service**: Click "Select Table" and choose a table number
- **Takeaway**: Click "Takeaway" button
- **Delivery**: Click "Delivery" button

#### 2. Add Customer (Optional)
1. Click "Add Customer" or search field
2. Search by phone number, name, or email
3. Select existing customer or "Add New Customer"
4. Customer loyalty points will be automatically applied

#### 3. Add Items to Order

**Using Categories:**
1. Click a category (Appetizers, Main Courses, etc.)
2. Click product images to add items
3. Items appear in cart on the right

**Using Search:**
1. Type in search bar (product name, SKU, or barcode)
2. Click search results to add items

**Using Barcode Scanner:**
1. Click "Scanner" button or press Space
2. Aim camera at barcode
3. Item automatically added when scanned

#### 4. Customize Items
Click any item in cart to:
- Change quantity (+ and - buttons)
- Add modifiers (extra cheese, no onions, etc.)
- Add special notes (well done, extra sauce, etc.)

#### 5. Apply Discounts
1. Click "Discount" button
2. Choose percentage or amount
3. Manager PIN required for discounts > 10%

#### 6. Process Payment
1. Click "Payment" button (or press F2)
2. Select payment method:
   - **Cash**: Enter amount received
   - **Card**: Process through terminal
   - **Mobile**: QR code payment
   - **Loyalty Points**: Use customer points
3. Click "Complete Payment"

#### 7. Print Receipt
- Automatic: Receipt prints after payment
- Manual: Click "Print Receipt" button
- Email: Send receipt to customer email

### Order Status Flow
1. **Pending** → Order created
2. **Confirmed** → Order sent to kitchen
3. **Preparing** → Kitchen started preparation
4. **Ready** → Food ready for serving
5. **Served** → Delivered to customer
6. **Completed** → Payment processed

### Splitting Bills
1. Complete order with all items
2. Click "Split Bill" in payment screen
3. Choose split method:
   - **Equal Split**: Divide total by number of people
   - **Item Split**: Assign specific items to each person
   - **Custom Amount**: Manual amounts per person
4. Process separate payments for each person

---

## Table Management

### Table Status Indicators
- **🟢 Available**: Table is clean and ready
- **🔴 Occupied**: Customers currently seated
- **🟡 Reserved**: Table reserved for future time
- **🔵 Cleaning**: Table needs cleaning

### Managing Tables

#### View All Tables
1. Navigate to "Tables" from main menu
2. See visual layout of all restaurant tables
3. Tables colored by status
4. Shows table capacity and location

#### Seat Customers
1. Click on an "Available" table
2. Click "Assign to Customer"
3. Search and select customer (optional)
4. Enter number of guests
5. Click "Confirm"

#### Update Table Status
1. Click on any table
2. Choose action:
   - "Mark Cleaning" (after customers leave)
   - "Make Available" (after cleaning)
   - "Mark Reserved" (for future reservation)
   - "Move Table" (reassign to different table)

#### Create Reservations
1. Click "New Reservation" button
2. Select table and reservation time
3. Enter customer information
4. Set number of guests
5. Add special requests (if any)
6. Click "Create Reservation"

#### Table View Features
- **Floor Plan**: Visual representation of restaurant layout
- **Filter Options**: Filter by table status or location
- **Quick Stats**: Number of tables by status
- **Time Tracking**: How long tables have been occupied

---

## Kitchen Display System (KDS)

### KDS Interface
```
┌─────────────────────────────────────────────────────────────┐
│ [🍳 KITCHEN DISPLAY] [Station: Grill] [Orders: 5]           │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│ │ ORD#12345   │ │ ORD#12346   │ │ ORD#12347   │             │
│ │ Table: T5   │ │ Table: T2   │ │ Takeaway   │             │
│ │ 14:25 | 15m │ │ 14:20 | 10m │ │ 14:30 | 20m│             │
│ ├─────────────┤ ├─────────────┤ ├─────────────┤             │
│ │ 🔥 URGENT   │ │ ⏰ Overdue  │ │ ⭐ VIP      │             │
│ └─────────────┘ └─────────────┘ └─────────────┘             │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                  ORDER #12345                          │ │
│ │ Table: T5 | Waiter: John | Time: 14:25                 │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ✅ Burger Deluxe x2                                     │ │
│ │    Extra Cheese, No Pickles, Well Done                  │ │
│ │                                                        │ │
│ │ 🔄 Fries x2                                           │ │
│ │    Extra Salt                                           │ │
│ │                                                        │ │
│ │ ⏳ Caesar Salad x1                                     │ │
│ │    No Croutons                                          │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Special: Customer allergic to nuts                      │ │
│ │ Notes: Rush order, business lunch                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ACTIONS: [✅ Start] [✅ Complete Item] [✓ Done] [❌ Cancel] │
└─────────────────────────────────────────────────────────────┘
```

### Using the Kitchen Display

#### Viewing Orders
- **Order Cards**: Each order shows in a card format
- **Priority Indicators**:
  - 🔥 Urgent (orders > 30 minutes old)
  - ⭐ VIP (loyalty customers)
  - ⏰ Overdue (past estimated time)
- **Order Information**: Table number, time elapsed, items

#### Managing Order Items
Each item in an order shows:
- **Status Dots**:
  - ⚪ Pending (not started)
  - 🔄 Preparing (in progress)
  - ✅ Ready (completed)
- **Quantity**: Number of items
- **Special Instructions**: Modifications and notes

#### Kitchen Actions
**Start Preparing:**
1. Click "Start Preparing" on order
2. Item status changes to "Preparing"
3. Timer starts for preparation time

**Complete Items:**
1. Click checkbox next to completed items
2. Item status changes to "Ready"
3. Updates waitstaff that item is ready

**Mark Order Done:**
1. When all items are ready, click "Done"
2. Order status changes to "Ready for Serving"
3. Waitstaff receives notification

**Cancel Items:**
1. Click "Cancel" for cancelled items
2. Enter reason for cancellation
3. Manager approval required for cancellations

#### Multiple Prep Stations
If your kitchen has multiple stations (Grill, Fryer, Bar, etc.):
- Each station shows only relevant items
- Orders automatically routed to correct stations
- Real-time sync between all stations

#### Communication Features
- **Special Requests**: Clearly highlighted for special orders
- **Allergy Alerts**: Red indicators for allergy-related requests
- **Waiter Notifications**: Waitstaff can send messages to kitchen
- **Time Tracking**: Automatic time tracking for order preparation

---

## Product Management

### Managing Menu Items

#### View Products
1. Navigate to "Products" from main menu
2. Browse by category or search for items
3. See current stock levels and status

#### Add New Product
1. Click "Add Product" button
2. Fill in product details:
   - **Basic Info**: Name, description, SKU, barcode
   - **Pricing**: Price, cost, tax rate
   - **Inventory**: Stock quantity, minimum stock level
   - **Category**: Assign to menu category
   - **Prep Time**: Minutes needed for preparation
3. Click "Save"

#### Edit Existing Product
1. Click "Edit" button on product
2. Update any fields as needed
3. Click "Save Changes"

#### Inventory Management
**Stock Levels:**
- **Current Stock**: Items available for sale
- **Min Stock Alert**: Low stock warning threshold
- **Last Updated**: When stock was last modified

**Stock Adjustments:**
1. Click product to view details
2. Click "Adjust Stock"
3. Enter new quantity
4. Select reason (waste, damage, recount, etc.)
5. Click "Update"

**Low Stock Alerts:**
- Red indicator when stock ≤ minimum level
- Automatic email notifications to managers
- Dashboard alerts for critical items

#### Barcode Management
**Add Barcode:**
1. Edit product
2. Enter barcode number (scan or type)
3. Click "Save"
4. Product now scannable in POS

**Scan Barcode:**
- Use built-in camera scanner
- Connect USB barcode scanner
- Automatic product lookup

#### Category Management
**Categories:**
- Organize menu items logically
- Set display order for POS
- Enable/disable categories

**Create Category:**
1. Click "Add Category" in Products page
2. Enter category name and description
3. Upload category image (optional)
4. Set display order
5. Click "Save"

---

## Customer Management

### Customer Database

#### Search Customers
1. Click "Customers" or use search in POS
2. Search by:
   - Phone number (most common)
   - Name
   - Email address
3. View customer history and loyalty status

#### Customer Information
**Profile Details:**
- Contact information
- Order history
- Loyalty tier and points
- Visit frequency
- Average spending

**Loyalty Tiers:**
- 🥉 Bronze: 0-499 points
- 🥈 Silver: 500-1499 points
- 🥇 Gold: 1500+ points

#### Adding New Customers
1. Search for customer (to check if existing)
2. Click "Add New Customer"
3. Enter:
   - Phone number (required)
   - Name and email
   - Birthday (for special offers)
   - Notes or preferences
4. Click "Save"

#### Loyalty Program
**Earning Points:**
- 1 point per $1 spent
- Points added automatically after payment
- Bonus points for special promotions

**Redeeming Points:**
- 100 points = $1 discount
- Applied during payment
- Points deducted from balance

**Customer Benefits:**
- Bronze: 0% discount
- Silver: 5% discount
- Gold: 10% discount

#### Customer Communication
**Special Offers:**
- Birthday discounts
- Anniversary promotions
- VIP exclusive deals

**Feedback Collection:**
- After dining surveys
- Service ratings
- Review collection

---

## Reports & Analytics

### Dashboard Overview
The main dashboard shows:

**Key Metrics:**
- Total sales today
- Number of orders
- Average order value
- Customer count
- Staff performance

**Visual Charts:**
- Sales by hour
- Popular menu items
- Payment method breakdown
- Revenue trends

### Available Reports

#### Daily Sales Report
**What it shows:**
- Total revenue for the day
- Order count and average value
- Payment method breakdown
- Tax collected
- Staff performance

**How to access:**
1. Navigate to "Reports"
2. Select "Daily Sales"
3. Choose date range
4. Click "Generate"

#### Popular Items Report
**What it shows:**
- Best-selling menu items
- Items by quantity sold
- Revenue per item
- Profit margins

**How to access:**
1. Go to "Reports"
2. Select "Popular Items"
3. Set date range
4. View top 50 items

#### Inventory Report
**What it shows:**
- Current stock levels
- Low stock items
- Stock value
- Days of supply remaining

**How to access:**
1. Navigate to "Reports"
2. Select "Inventory"
3. View current status

#### Staff Performance Report
**What it shows:**
- Orders per staff member
- Revenue generated
- Average order value
- Tips collected
- Customer satisfaction

#### Customer Analytics
**What it shows:**
- New vs returning customers
- Customer visit frequency
- Average customer spending
- Loyalty program participation

### Export Options
**Export Formats:**
- CSV (for Excel)
- PDF (for printing)
- JSON (for data analysis)

**How to Export:**
1. Generate any report
2. Click "Export" button
3. Choose format
4. Download file

### Custom Reports
**Create Custom Report:**
1. Click "Custom Report"
2. Select date range
3. Choose metrics to include
4. Add filters
5. Generate and save

**Scheduled Reports:**
1. Set up automatic email delivery
2. Choose frequency (daily, weekly, monthly)
3. Select recipients
4. Configure report parameters

---

## Settings & Configuration

### Restaurant Information
**Basic Settings:**
- Restaurant name and address
- Contact information
- Operating hours
- Tax rates

**Location Settings:**
- Currency and language
- Time zone
- Multiple branch management

### User Management

#### Staff Accounts
**Add Staff Member:**
1. Go to "Settings" → "Users"
2. Click "Add User"
3. Enter staff information:
   - Name and email
   - Role (Cashier, Manager, etc.)
   - Assigned branch
   - Phone number
4. Set initial password
5. Click "Create"

**User Roles and Permissions:**
- **Owner**: Full access to all features
- **Manager**: Branch management, reports, staff
- **Cashier**: Orders, payments, customer service
- **Kitchen**: Order viewing, item status updates
- **Waitstaff**: Table management, order taking

**Manage Existing Users:**
- Edit user information
- Change roles and permissions
- Reset passwords
- Deactivate accounts

### Payment Configuration

#### Payment Methods
**Enable Methods:**
- Cash payments
- Credit/Debit cards
- Mobile wallets
- Gift cards
- Loyalty points

**Payment Terminal Setup:**
- Terminal ID and merchant ID
- Card reader configuration
- Receipt printing options

#### Tax Configuration
**Tax Settings:**
- Default tax rate (8% standard)
- Multiple tax rates for different items
- Tax-exempt items
- Service charge configuration

### Hardware Setup

#### Printer Configuration
**Receipt Printer:**
- Thermal printer setup
- Paper size and type
- Custom receipt header/footer
- Auto-print settings

**Kitchen Printer:**
- KOT printer setup
- Multiple kitchen stations
- Order routing
- Print formatting

#### Scanner Setup
**Barcode Scanner:**
- USB scanner configuration
- Camera scanner settings
- Barcode format types
- Scanner testing

#### Cash Drawer Setup
**Cash Drawer:**
- Serial port configuration
- Open command settings
- Connection testing
- Automatic opening on cash payments

### System Preferences

#### Display Settings
- Theme (light/dark)
- Language preference
- Date/time format
- Currency display

#### Notification Settings
- Low stock alerts
- Order notifications
- System maintenance alerts
- Email notifications

#### Security Settings
- Session timeout duration
- Password requirements
- Two-factor authentication
- Access logs

---

## Keyboard Shortcuts

### POS Shortcuts
- **F1** - Help/Manual
- **F2** - Open Payment Screen
- **F3** - Customer Search
- **F4** - Apply Discount
- **F5** - Refresh/Reload
- **Ctrl + D** - Duplicate Last Item
- **Ctrl + S** - Save Order
- **Ctrl + P** - Print Receipt
- **Space** - Toggle Barcode Scanner
- **Escape** - Clear Cart

### Global Shortcuts
- **Ctrl + /** - Show keyboard shortcuts help
- **Ctrl + Shift + L** - Lock screen
- **Ctrl + Shift + S** - Settings
- **Ctrl + Shift + R** - Reports
- **Ctrl + Shift + U** - User profile

### Navigation Shortcuts
- **Alt + 1-9** - Quick navigation to menu items
- **Alt + C** - Categories
- **Alt + P** - Products
- **Alt + T** - Tables
- **Alt + R** - Reports
- **Alt + S** - Settings

### Quick Actions
- **+** - Increase quantity of selected item
- **-** - Decrease quantity of selected item
- **Enter** - Confirm action
- **Tab** - Move between fields
- **Shift + Tab** - Move backward between fields

---

## Troubleshooting

### Common Issues

#### Login Problems
**Can't log in:**
1. Check email spelling
2. Verify password is correct
3. Check internet connection
4. Try clearing browser cache
5. Contact manager if account is locked

**Session expired:**
1. Log in again with your credentials
2. Check "Remember me" for convenience
3. Contact admin if frequent expirations

#### Order Issues
**Item not adding to cart:**
1. Check if item is in stock
2. Verify item is active
3. Refresh the page
4. Try searching for the item

**Payment not processing:**
1. Check internet connection
2. Verify payment method setup
3. Try alternative payment method
4. Contact manager for assistance

#### Scanner Not Working
**Barcode scanner not scanning:**
1. Check scanner is connected
2. Verify scanner type is configured
3. Try using camera scanner instead
4. Test with known good barcode

**Camera scanner not working:**
1. Allow camera permissions in browser
2. Check if camera is working elsewhere
3. Try different browser
4. Ensure good lighting conditions

#### Printer Issues
**Receipt not printing:**
1. Check printer connection
2. Verify paper is loaded
3. Check printer configuration
4. Try test print from settings

#### Performance Issues
**System running slow:**
1. Check internet connection speed
2. Clear browser cache and cookies
3. Close other browser tabs
4. Restart browser or computer

### Error Messages

#### Common Error Messages
**"Authentication Failed"**
- Incorrect email or password
- Account locked or inactive
- Network connectivity issues

**"Insufficient Stock"**
- Item not available in inventory
- Check if item is marked as active
- Contact manager about inventory

**"Payment Declined"**
- Card declined by bank
- Invalid payment details
- Payment terminal not connected

**"Printer Error"**
- Printer offline or disconnected
- Paper jam or out of paper
- Configuration issues

### Getting Help

#### In-App Help
- Press **F1** for context-sensitive help
- Look for help icons (❓) throughout the app
- Check the knowledge base section

#### Contact Support
- **Technical Issues**: Contact your restaurant manager
- **System Admin**: support@restaurant-pos.com
- **Emergency**: Call the support hotline

#### Training Resources
- **Video Tutorials**: Available in the help section
- **User Manual**: Complete documentation
- **On-site Training**: Schedule with restaurant manager
- **Online Training**: Webinars and workshops

### Maintenance Schedule

#### Regular Maintenance
- **Daily**: System health check
- **Weekly**: Data backup verification
- **Monthly**: Software updates
- **Quarterly**: Full system audit

#### Self-Service Options
- **Restart Application**: Refresh browser page
- **Clear Cache**: Clear browser data
- **Check Status**: System status page
- **User Diagnostics**: Run built-in diagnostics

---

## Tips for Efficient Use

### For Cashiers
- **Memorize keyboard shortcuts** for faster service
- **Use barcode scanner** for quick item lookup
- **Learn product codes** for manual entry
- **Practice customer search** techniques
- **Know common issues** and quick fixes

### For Kitchen Staff
- **Monitor order priorities** (urgent, VIP, overdue)
- **Communicate with waitstaff** about delays
- **Update item status** promptly
- **Report inventory issues** immediately
- **Keep workstation organized**

### For Managers
- **Monitor daily sales** and customer flow
- **Review staff performance** regularly
- **Check inventory levels** and order supplies
- **Handle customer complaints** professionally
- **Train new staff** effectively

### Best Practices
- **Always verify order details** before payment
- **Double-check special requests** and allergies
- **Keep customer information** confidential
- **Maintain clean and organized workspace**
- **Report technical issues** promptly

---

## Security Guidelines

### Password Security
- Use strong, unique passwords
- Change passwords regularly
- Don't share credentials
- Log out when finished
- Report suspicious activity

### Data Protection
- Never share customer information
- Follow GDPR and privacy regulations
- Backup data regularly
- Report data breaches immediately
- Use secure internet connections

### Physical Security
- Keep devices secure and locked
- Log out of shared computers
- Report stolen devices immediately
- Use screen privacy filters
- Be aware of surroundings

---

This user guide provides comprehensive instructions for all aspects of the Restaurant POS System. Keep it bookmarked for quick reference, and don't hesitate to contact support if you need assistance!