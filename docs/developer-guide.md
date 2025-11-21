# 🛠️ Developer Guide

Complete developer documentation for the Restaurant POS System.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Code Standards](#code-standards)
- [Database Schema](#database-schema)
- [API Development](#api-development)
- [Frontend Development](#frontend-development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    RESTAURANT POS SYSTEM                    │
├─────────────────────────────────────────────────────────────┤
│                     FRONTEND LAYER                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │   React     │ │    React    │ │    React    │            │
│  │    POS      │ │   Kitchen   │ │    Admin    │            │
│  │   Terminal  │ │   Display   │ │   Panel     │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                   OFFLINE SYNC LAYER                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ IndexedDB   │ │  Service    │ │  Conflict   │            │
│  │   Cache     │ │   Worker    │ │ Resolution  │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│                    BACKEND LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  SUPABASE                               ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       ││
│  │  │ PostgreSQL  │ │  Supabase   │ │   Storage   │       ││
│  │  │ Database    │ │  Auth/RLS   │ │   Bucket    │       ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘       ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       ││
│  │  │  Real-time  │ │  Edge       │ │   Vector    │       ││
│  │  │ Subscriptions│ │ Functions  │ │  Analytics  │       ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘       ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                   DEVICE LAYER                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │    Thermal  │ │    Barcode  │ │   Kitchen   │            │
│  │   Printer   │ │   Scanner   │ │   Printer   │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **State Management**: React Query, Context API
- **Build Tools**: Create React App, Webpack
- **Testing**: Jest, React Testing Library
- **Deployment**: Netlify, Vercel, Docker

---

## Development Setup

### Prerequisites
- Node.js 16+ and npm
- Git
- Supabase account
- Modern web browser
- Code editor (VS Code recommended)

### VS Code Extensions (Recommended)
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-thunder-client"
  ]
}
```

### Environment Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/restaurant-pos.git
cd restaurant-pos

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Install Supabase CLI (optional)
npm install -g supabase

# Start development server
npm start
```

### Environment Variables
```env
# Development
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_ENV=development

# Feature Flags
REACT_APP_ENABLE_OFFLINE=true
REACT_APP_ENABLE_BARCODE_SCANNING=true
REACT_APP_ENABLE_RECEIPT_PRINTING=true
REACT_APP_ENABLE_KITCHEN_DISPLAY=true
```

### Supabase Setup
1. Create Supabase project
2. Run schema files in order:
   - `supabase/schema.sql`
   - `supabase/rls_policies.sql`
   - `supabase/functions.sql`
   - `supabase/seed_data.sql`

---

## Project Structure

```
src/
├── components/              # Reusable components
│   ├── ui/                 # Basic UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── BarcodeScanner.tsx  # Barcode scanning component
│   ├── CustomerSearch.tsx  # Customer lookup
│   ├── Layout.tsx          # Main layout
│   ├── LoadingScreen.tsx   # Loading states
│   └── PaymentModal.tsx    # Payment processing
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts          # Authentication logic
│   ├── useCart.ts          # Shopping cart
│   └── useKeyboardShortcuts.ts
├── lib/                    # Utility libraries
│   ├── supabase.ts         # Supabase client
│   ├── printer.ts          # Receipt printing
│   ├── scanner.ts          # Barcode scanning
│   └── cashDrawer.ts       # Cash drawer control
├── pages/                  # Page components
│   ├── LoginPage.tsx
│   ├── POSPage.tsx
│   ├── TableManagementPage.tsx
│   ├── KitchenDisplayPage.tsx
│   ├── ProductManagementPage.tsx
│   ├── ReportsPage.tsx
│   └── SettingsPage.tsx
├── types/                  # TypeScript definitions
│   └── index.ts
├── App.tsx                 # Main app
├── index.css               # Global styles
└── index.ts                # Entry point
```

### Component Architecture
```typescript
// Example component structure
interface ComponentProps {
  prop1: string;
  prop2?: number;
  onClick?: () => void;
}

const Component: React.FC<ComponentProps> = ({
  prop1,
  prop2 = 0,
  onClick
}) => {
  // Custom hooks
  const { data, loading, error } = useCustomHook();

  // Event handlers
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  // Render logic
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="component-wrapper">
      {/* JSX content */}
    </div>
  );
};

export default Component;
```

---

## Code Standards

### TypeScript Guidelines
```typescript
// Use interfaces for object shapes
interface Product {
  id: string;
  name: string;
  price: number;
  category?: Category;
}

// Use union types for enums
type OrderStatus = 'pending' | 'confirmed' | 'completed';

// Use generic types for APIs
interface ApiResponse<T> {
  data: T[];
  error: string | null;
  status: number;
}

// Use readonly for immutable data
interface ImmutableConfig {
  readonly apiUrl: string;
  readonly apiKey: string;
}
```

### React Best Practices
```typescript
// Custom hooks for logic separation
const useProductData = (productId: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load product data
    loadProduct(productId);
  }, [productId]);

  return { product, loading };
};

// Component composition
const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
  <Card>
    <ProductImage src={product.image} alt={product.name} />
    <ProductInfo product={product} />
    <ProductActions product={product} />
  </Card>
);

// Error boundaries
class ErrorBoundary extends React.Component {
  // Error boundary implementation
}
```

### CSS Guidelines (Tailwind)
```typescript
// Use consistent spacing scale
const spacing = {
  xs: 'p-1', sm: 'p-2', md: 'p-4', lg: 'p-6', xl: 'p-8'
};

// Use consistent color palette
const colors = {
  primary: 'bg-primary-600 hover:bg-primary-700',
  secondary: 'bg-gray-200 hover:bg-gray-300',
  success: 'bg-green-600 hover:bg-green-700',
  warning: 'bg-yellow-600 hover:bg-yellow-700',
  danger: 'bg-red-600 hover:bg-red-700'
};

// Use utility classes with Tailwind
const Button: React.FC<ButtonProps> = ({ variant, children }) => (
  <button className={clsx(
    'btn', // Base button class
    colors[variant], // Variant-specific colors
    'transition-colors duration-200' // Consistent transitions
  )}>
    {children}
  </button>
);
```

### File Naming Conventions
```typescript
// Components: PascalCase
ProductCard.tsx
CustomerSearch.tsx

// Hooks: camelCase with 'use' prefix
useAuth.ts
useCart.ts

// Utilities: camelCase
apiService.ts
dateUtils.ts

// Types: camelCase
productTypes.ts
userTypes.ts

// Constants: UPPER_SNAKE_CASE
API_ENDPOINTS.ts
ERROR_MESSAGES.ts
```

---

## Database Schema

### Key Tables
```sql
-- Core tables
users                    -- Staff accounts
branches                 -- Restaurant locations
products                 -- Menu items and inventory
categories               -- Product categories
orders                   -- Customer orders
order_items              -- Line items in orders
customers                -- Customer information
payments                 -- Payment records

-- Restaurant specific
restaurant_tables        -- Table management
table_orders             -- Table assignments
loyalty_programs         -- Customer rewards

-- System tables
stock_movements          -- Inventory tracking
activity_logs            -- Audit trail
```

### Relationships
```sql
-- User-Branch relationship
users.branch_id → branches.id

-- Product-Category relationship
products.category_id → categories.id

-- Order relationships
orders.branch_id → branches.id
orders.table_id → restaurant_tables.id
orders.customer_id → customers.id

-- Order Items relationship
order_items.order_id → orders.id
order_items.product_id → products.id
```

### Indexes for Performance
```sql
-- Frequently queried columns
CREATE INDEX idx_products_branch_category ON products(branch_id, category_id);
CREATE INDEX idx_orders_branch_status ON orders(branch_id, status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Search optimization
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_customers_phone ON customers(phone);
```

### Row Level Security (RLS)
```sql
-- Example RLS policy
CREATE POLICY "Users can view branch data"
ON products
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND (
    -- Owners can see all products
    (SELECT role FROM users WHERE id = auth.uid()) = 'owner'
    -- Others can only see their branch products
    OR branch_id = (SELECT branch_id FROM users WHERE id = auth.uid())
  )
);
```

---

## API Development

### Supabase Service Classes
```typescript
// Base service class
export class SupabaseService<T = any> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async getAll(filters?: Record<string, any>) {
    let query = supabase.from(this.tableName).select('*');

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;
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
}

// Specific service example
export class ProductService extends SupabaseService<Product> {
  constructor() {
    super('products');
  }

  async getByBarcode(barcode: string, branchId?: string) {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('barcode', barcode)
      .eq('is_active', true);

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query.single();
    return { data, error };
  }
}
```

### Error Handling
```typescript
// API error handling
export const handleApiError = (error: any) => {
  console.error('API Error:', error);

  // Return user-friendly error message
  if (error.code === 'PGRST116') {
    return 'Item not found';
  }

  if (error.code === '23505') {
    return 'Duplicate entry';
  }

  if (error.code === '42501') {
    return 'Permission denied';
  }

  return 'An error occurred. Please try again.';
};

// Usage in components
const { data, error } = await productService.create(productData);
if (error) {
  toast.error(handleApiError(error));
  return;
}
```

### Real-time Subscriptions
```typescript
// Real-time updates
export const subscribeToOrders = (branchId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('orders')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `branch_id=eq.${branchId}`
      },
      callback
    )
    .subscribe();
};

// Usage in component
useEffect(() => {
  const subscription = subscribeToOrders(branchId, (payload) => {
    // Handle order update
    if (payload.eventType === 'INSERT') {
      addOrder(payload.new);
    } else if (payload.eventType === 'UPDATE') {
      updateOrder(payload.new);
    }
  });

  return () => {
    supabase.removeChannel(subscription);
  };
}, [branchId]);
```

### Type Safety
```typescript
// Generic API response
interface ApiResult<T> {
  data: T | null;
  error: any;
  loading: boolean;
}

// Hook with type safety
const useApiCall = <T>(
  apiCall: () => Promise<{ data: T | null; error: any }>
): ApiResult<T> => {
  const [result, setResult] = useState<ApiResult<T>>({
    data: null,
    error: null,
    loading: false
  });

  const execute = useCallback(async () => {
    setResult(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await apiCall();
      setResult({ data, error, loading: false });
    } catch (error) {
      setResult({ data: null, error, loading: false });
    }
  }, [apiCall]);

  return { ...result, execute };
};
```

---

## Frontend Development

### State Management Patterns
```typescript
// Context API for global state
interface AppContextType {
  user: User | null;
  cart: Cart;
  theme: 'light' | 'dark';
  setUser: (user: User | null) => void;
  updateCart: (item: CartItem) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <AppContext.Provider value={{
      user, setUser,
      cart, updateCart,
      theme, toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
```

### Component Patterns
```typescript
// Higher-order component for authentication
const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { user, loading } = useAuth();

    if (loading) {
      return <LoadingScreen />;
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    return <Component {...props} />;
  };
};

// Usage
const ProtectedComponent = withAuth(YourComponent);

// Render props pattern
const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  renderRow
}: {
  data: T[];
  columns: ColumnConfig<T>[];
  renderRow: (item: T) => React.ReactNode;
}) => (
  <table>
    <thead>
      <tr>
        {columns.map(column => (
          <th key={column.key}>{column.title}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.map(renderRow)}
    </tbody>
  </table>
);
```

### Performance Optimization
```typescript
// React.memo for component memoization
const ProductCard = React.memo<ProductCardProps>(({ product, onSelect }) => {
  return (
    <Card onClick={() => onSelect(product)}>
      <ProductImage src={product.image} alt={product.name} />
      <ProductInfo product={product} />
    </Card>
  );
}, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id;
});

// useMemo for expensive calculations
const ExpensiveComponent = ({ items }: { items: Item[] }) => {
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  return <div>Total: ${total.toFixed(2)}</div>;
};

// useCallback for function memoization
const ParentComponent = () => {
  const [items, setItems] = useState<Item[]>([]);

  const handleItemSelect = useCallback((item: Item) => {
    setItems(prev => [...prev, item]);
  }, []);

  return (
    <div>
      {items.map(item => (
        <ProductItem
          key={item.id}
          item={item}
          onSelect={handleItemSelect}
        />
      ))}
    </div>
  );
};
```

### Form Handling
```typescript
// Form with validation
const ProductForm = ({ initialProduct, onSubmit }: ProductFormProps) => {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!product.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (product.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(product);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Product Name"
        value={product.name}
        onChange={(value) => setProduct({ ...product, name: value })}
        error={errors.name}
      />
      <Input
        label="Price"
        type="number"
        value={product.price}
        onChange={(value) => setProduct({ ...product, price: parseFloat(value) || 0 })}
        error={errors.price}
      />
      <Button type="submit">Save Product</Button>
    </form>
  );
};
```

---

## Testing

### Unit Testing
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 10.99,
    image: 'test.jpg'
  };

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$10.99')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'test.jpg');
  });

  it('calls onSelect when clicked', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    render(<ProductCard product={mockProduct} onSelect={onSelect} />);

    await user.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(mockProduct);
  });
});

// Hook testing
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('initializes with null user', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('handles login correctly', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(result.current.user).toBeDefined();
    expect(result.current.loading).toBe(false);
  });
});
```

### Integration Testing
```typescript
// API integration testing
import { supabase } from '../lib/supabase';

describe('ProductService Integration', () => {
  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();
  });

  afterAll(async () => {
    // Cleanup test database
    await cleanupTestDatabase();
  });

  it('creates and retrieves product', async () => {
    const newProduct = {
      name: 'Test Product',
      price: 9.99,
      category_id: 'test-category-id'
    };

    // Create product
    const { data: created, error: createError } = await productService.create(newProduct);
    expect(createError).toBeNull();
    expect(created).toBeDefined();

    // Retrieve product
    const { data: retrieved, error: retrieveError } = await productService.getById(created.id);
    expect(retrieveError).toBeNull();
    expect(retrieved.name).toBe(newProduct.name);
    expect(retrieved.price).toBe(newProduct.price);
  });
});
```

### E2E Testing with Playwright
```typescript
// e2e/pos.spec.ts
import { test, expect } from '@playwright/test';

test.describe('POS Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'cashier@restaurant.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
  });

  test('can complete an order', async ({ page }) => {
    // Add item to cart
    await page.click('[data-testid="product-burger"]');
    await page.click('[data-testid="product-fries"]');

    // Check cart
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('2');

    // Process payment
    await page.click('[data-testid="payment-button"]');
    await page.click('[data-testid="payment-method-cash"]');
    await page.fill('[data-testid="cash-amount"]', '25.00');
    await page.click('[data-testid="complete-payment"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('0');
  });
});
```

### Testing Configuration
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/setupTests.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

// setupTests.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Mock Supabase
jest.mock('@supabase/supabase-js');

// Start MSW server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Deployment

### Production Build
```bash
# Create production build
npm run build

# Test production build locally
npm run test:build

# Analyze bundle size
npm run analyze
```

### Environment Configuration
```typescript
// Environment-specific configurations
const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    enableDebug: true,
    enableMocks: true
  },
  production: {
    apiUrl: 'https://your-app.com',
    enableDebug: false,
    enableMocks: false
  }
};

const currentConfig = config[process.env.NODE_ENV as keyof typeof config] || config.development;
export default currentConfig;
```

### Docker Configuration
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Deployment Scripts
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment..."

# Build application
echo "📦 Building application..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm test

# Deploy to Netlify
if command -v netlify &> /dev/null; then
  echo "🌐 Deploying to Netlify..."
  netlify deploy --prod --dir=build
fi

# Deploy to Vercel
if command -l vercel &> /dev/null; then
  echo "🌐 Deploying to Vercel..."
  vercel --prod
fi

echo "✅ Deployment complete!"
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage --watchAll=false

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: build/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: build-files
      - uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        run: |
          netlify deploy --prod --dir=.
```

---

## Troubleshooting

### Common Issues

#### Build Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npx tsc --noEmit
```

#### Supabase Connection Issues
```typescript
// Debug Supabase connection
const debugSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('branches').select('count');
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connection OK:', data);
    }
  } catch (err) {
    console.error('Connection test failed:', err);
  }
};
```

#### Performance Issues
```typescript
// Performance monitoring
const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Memory leak detection
useEffect(() => {
  const interval = setInterval(() => {
    console.log('Memory usage:', performance.memory);
  }, 10000);

  return () => clearInterval(interval);
}, []);
```

#### Debug Mode
```typescript
// Debug utility
const debug = process.env.NODE_ENV === 'development' ?
  (message: string, data?: any) => console.log(`[DEBUG] ${message}`, data) :
  () => {};

// Usage
debug('Loading products', products);
debug('User logged in', user);
```

### Browser Compatibility
```typescript
// Feature detection
const features = {
  webSerial: 'serial' in navigator,
  webBluetooth: 'bluetooth' in navigator,
  serviceWorker: 'serviceWorker' in navigator,
  notification: 'Notification' in window
};

// Fallback for unsupported features
const Scanner = features.webSerial ?
  SerialScanner :
  FallbackScanner;
```

### Error Monitoring
```typescript
// Error boundary with logging
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: any) {
    // Log to error service
    logError(error, errorInfo);

    // Show user-friendly error
    this.setState({ hasError: true, error: error.message });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error}</p>
          <button onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Performance Optimization
```typescript
// Bundle analysis
const analyzeBundle = () => {
  const bundle = require('./build/static/js/main.chunk.js');
  const size = bundle.length / 1024 / 1024; // MB

  console.log(`Bundle size: ${size.toFixed(2)} MB`);

  if (size > 5) {
    console.warn('Bundle size is large, consider code splitting');
  }
};

// Lazy loading components
const AdminPanel = React.lazy(() => import('./AdminPanel'));

// Usage with Suspense
<Suspense fallback={<Loading />}>
  <AdminPanel />
</Suspense>
```

---

This developer guide provides comprehensive information for working with the Restaurant POS System. Keep this guide bookmarked and contribute to it as the system evolves.