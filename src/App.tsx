import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import RealtimeProvider from './components/RealtimeProvider';

// Pages
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POSPage';
import TableManagementPage from './pages/TableManagementPage';
import KitchenDisplayPage from './pages/KitchenDisplayPage';
import ProductManagementPage from './pages/ProductManagementPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

// Components
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({
  children,
  requiredRole
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/pos" replace />;
  }

  return <>{children}</>;
};

// Public route component (redirect if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    // Redirect based on user role
    switch (user.role) {
      case 'kitchen':
        return <Navigate to="/kitchen" replace />;
      case 'owner':
      case 'manager':
        return <Navigate to="/reports" replace />;
      default:
        return <Navigate to="/pos" replace />;
    }
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Default route */}
        <Route index element={<Navigate to="/pos" replace />} />

        {/* Main POS Page - Accessible to Cashier, Waitstaff, Manager */}
        <Route
          path="pos"
          element={
            <ProtectedRoute>
              <POSPage />
            </ProtectedRoute>
          }
        />

        {/* Table Management - Waitstaff, Manager, Owner */}
        <Route
          path="tables"
          element={
            <ProtectedRoute>
              <TableManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Kitchen Display - Kitchen Staff */}
        <Route
          path="kitchen"
          element={
            <ProtectedRoute requiredRole="kitchen">
              <KitchenDisplayPage />
            </ProtectedRoute>
          }
        />

        {/* Product Management - Manager, Owner */}
        <Route
          path="products"
          element={
            <ProtectedRoute>
              <ProductManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Reports - Manager, Owner */}
        <Route
          path="reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Settings - Manager, Owner */}
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <RealtimeProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <AppRoutes />
              </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Router>
        </RealtimeProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;