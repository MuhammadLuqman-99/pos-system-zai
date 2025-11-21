# 🍔 Restaurant POS System

A complete, production-grade Point of Sale system for restaurants, built with React and Supabase. Features table management, real-time kitchen display, inventory tracking, customer loyalty, and comprehensive reporting.

## ✨ Features

### 🎯 Core POS Features
- **Multi-User Roles**: Owner, Manager, Cashier, Kitchen Staff, Waitstaff
- **Table Management**: Visual table status, reservations, and seating
- **Order Processing**: Split bills, modifiers, special requests
- **Payment Processing**: Cash, card, mobile, and loyalty points
- **Real-time Updates**: Live kitchen display and order status with WebSocket notifications
- **Multi-device Sync**: Instant updates across all connected devices

### 📦 Inventory & Menu
- **Product Management**: Categories, modifiers, allergens, pricing
- **Stock Tracking**: Real-time inventory, low stock alerts
- **Barcode Scanning**: Camera-based and USB scanner support
- **Recipe Management**: Ingredient tracking and cost analysis

### 👥 Customer Management
- **Loyalty Program**: Points, tiers, and rewards
- **Customer Profiles**: Order history and preferences
- **Customer Search**: Quick lookup by phone, name, or email

### 📊 Analytics & Reporting
- **Sales Reports**: Daily, weekly, monthly summaries
- **Popular Items**: Best-selling menu items analysis
- **Staff Performance**: Individual productivity metrics
- **Inventory Reports**: Stock valuation and movements

### 🏪 Multi-Branch Support
- **Branch Management**: Multiple restaurant locations
- **Role-Based Access**: Per-branch user permissions
- **Centralized Data**: Cross-branch reporting and analytics

### 📱 Modern UI/UX
- **Responsive Design**: Works on desktop, tablets, and mobile
- **Keyboard Shortcuts**: F2 payment, F3 customer search, etc.
- **Offline Support**: Local caching with background sync
- **Real-time Sync**: WebSocket-based live updates with audio notifications
- **Connection Status**: Visual indicator for real-time connectivity
- **Instant Notifications**: Toast notifications for all system events

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Query** for state management
- **React Router** for navigation
- **Recharts** for analytics
- **React Hot Toast** for notifications

### Backend
- **Supabase** (PostgreSQL + Real-time + Auth)
- **Row Level Security** for data protection
- **Edge Functions** for complex operations
- **Real-time Subscriptions** for live updates

### Integrations
- **Barcode Scanning** (jsQR library)
- **Receipt Printing** (Thermal printers)
- **Payment Processing** (Stripe ready)
- **Kitchen Display** (WebSocket streaming)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Supabase account (free tier works)
- Git for version control

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/restaurant-pos.git
cd restaurant-pos
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL files in the `supabase/` folder in order:
     1. `schema.sql` - Database tables and functions
     2. `rls_policies.sql` - Security policies
     3. `functions.sql` - Database functions
     4. `seed_data.sql` - Sample data (optional)

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

5. **Start the development server**
```bash
npm start
# or
yarn start
```

6. **Open your browser**
Navigate to `http://localhost:3000`

### Demo Accounts
Use these demo accounts to test the system:

- **Owner**: `owner@restaurant.com` / `password123`
- **Manager**: `manager@restaurant.com` / `password123`
- **Cashier**: `cashier@restaurant.com` / `password123`
- **Kitchen**: `kitchen@restaurant.com` / `password123`

## 📁 Project Structure

```
restaurant-pos/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Basic UI components
│   │   ├── BarcodeScanner.tsx
│   │   ├── PaymentModal.tsx
│   │   └── CustomerSearch.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useKeyboardShortcuts.ts
│   ├── lib/              # Utility functions
│   │   └── supabase.ts   # Supabase client setup
│   ├── pages/            # Page components
│   │   ├── LoginPage.tsx
│   │   ├── POSPage.tsx
│   │   ├── TableManagementPage.tsx
│   │   ├── KitchenDisplayPage.tsx
│   │   ├── ProductManagementPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main app component
│   └── index.css         # Global styles
├── supabase/             # Database setup files
│   ├── schema.sql        # Database schema
│   ├── rls_policies.sql  # Security policies
│   ├── functions.sql     # Database functions
│   └── seed_data.sql     # Sample data
└── docs/                 # Documentation
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration
REACT_APP_APP_NAME=Restaurant POS
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_OFFLINE=true
REACT_APP_ENABLE_BARCODE_SCANNING=true
REACT_APP_ENABLE_RECEIPT_PRINTING=true
REACT_APP_ENABLE_KITCHEN_DISPLAY=true
```

### Customization

#### Branding
- Update the restaurant name and logo in `src/pages/LoginPage.tsx`
- Customize colors in `tailwind.config.js`

#### Menu Items
- Add/edit products through the Products page in the app
- Or directly in the database via `supabase/seed_data.sql`

#### Tax & Service Rates
- Configure in Settings page or directly in the branches table

## 📖 User Guide

### For Restaurant Staff

#### **Login**
1. Open the POS URL in your browser
2. Enter your email and password
3. Select your branch (if applicable)

#### **Taking Orders**
1. Select customer or table
2. Add items from categories
3. Add modifiers and special requests
4. Apply discounts if needed
5. Process payment

#### **Kitchen Display**
- View orders in real-time
- Update preparation status
- Mark items as ready for serving

#### **Table Management**
- View table availability
- Seat customers
- Track table status

#### **Reports**
- View daily/weekly sales
- Analyze popular items
- Monitor staff performance

### For Managers

#### **User Management**
- Add/remove staff accounts
- Assign roles and permissions
- Manage branch access

#### **Inventory**
- Update stock levels
- Track waste and adjustments
- Set minimum stock alerts

#### **Settings**
- Configure tax rates
- Set up payment methods
- Customize receipts
- Manage integrations

## 🔒 Security

- **Row Level Security**: Users can only access data from their branch
- **Role-Based Access**: Granular permissions for different user roles
- **Input Validation**: All inputs are validated and sanitized
- **Password Security**: Strong password requirements with hashing
- **Audit Logging**: All user actions are logged for accountability

## 📱 Mobile Support

The POS system is fully responsive and works on:
- **Desktop** (1920x1080+)
- **Tablet** (768x1024+)
- **Mobile** (375x667+)

Recommended devices:
- **iPad/Tablet** for table management and ordering
- **Desktop** for back-office and reporting
- **Mobile** for quick order taking and payments

## 🖨️ Hardware Integration

### Printers
- **Thermal Printers**: EPSON, Star, Custom
- **Kitchen Printers**: Order tickets and KOT
- **Label Printers**: Barcode labels

### Scanners
- **USB Barcode Scanners**: Plug and play
- **Camera Scanners**: Built-in device cameras
- **QR Code Scanners**: Mobile payments and loyalty

### Payment Terminals
- **Card Readers**: USB/Bluetooth integration
- **Cash Drawers**: Automatic opening
- **POS Displays**: Customer-facing screens

## 🌐 Deployment

### Netlify (Recommended)
```bash
npm run build
# Upload the build/ folder to Netlify
```

### Vercel
```bash
npm run build
# Deploy to Vercel
```

### Traditional Hosting
```bash
npm run build
# Serve the build/ folder with any web server
```

### Environment Setup
- Production: Set `REACT_APP_ENV=production`
- Staging: Set `REACT_APP_ENV=staging`
- Development: Default environment

## 🧪 Testing

### Unit Tests
```bash
npm test
# or
yarn test
```

### E2E Tests
```bash
npm run test:e2e
# or
yarn test:e2e
```

### Manual Testing Checklist
- [ ] Login/logout functionality
- [ ] Order creation and payment
- [ ] Table management
- [ ] Kitchen display updates
- [ ] Inventory changes
- [ ] Report generation
- [ ] Mobile responsiveness

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing code style
- Write tests for new features
- Update documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Documentation

- [📖 User Guide](docs/user-guide.md) - Complete user manual
- [🔧 Developer Guide](docs/developer-guide.md) - Technical documentation
- [📡 API Reference](docs/api-reference.md) - Full API documentation
- [🔌 Real-time API](docs/realtime-api.md) - WebSocket and real-time features
- [🔐 Security Guide](docs/security-guide.md) - Security best practices
- [💾 Offline Mode](docs/offline-mode.md) - Offline functionality
- [🗄️ Database Schema](docs/db-schema.md) - Database structure
- [👥 Roles & Permissions](docs/roles-permissions.md) - Access control

## 🆘 Support

- **Documentation**: Check the `docs/` folder above
- **Issues**: Open an issue on GitHub
- **Email**: support@restaurant-pos.com
- **Discord**: Join our community server

## 🗺️ Roadmap

### Version 1.1 (Upcoming)
- [ ] Advanced inventory management
- [ ] Staff scheduling
- [ ] Advanced reporting
- [ ] Mobile apps (iOS/Android)

### Version 1.2 (Future)
- [ ] Delivery management
- [ ] Online ordering integration
- [ ] Accounting software integration
- [ ] Multi-currency support

### Version 2.0 (Future)
- [ ] AI-powered recommendations
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations
- [ ] Enterprise features

## 📊 Analytics

The system tracks:
- User engagement and activity
- Sales performance and trends
- System performance and errors
- Hardware usage statistics

---

**Built with ❤️ for the restaurant industry**

Made with React, Supabase, and Tailwind CSS