import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RealtimeStatus from './RealtimeStatus';
import {
  Utensils,
  Table,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  ChefHat,
  Wifi,
  WifiOff,
  Bell,
  User
} from 'lucide-react';
import { Button } from './ui/Button';

interface LayoutProps {}

const Layout: React.FC<LayoutProps> = () => {
  const { user, signOut, hasRole, canAccess } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const navigation = [
    {
      name: 'POS Terminal',
      href: '/pos',
      icon: Utensils,
      roles: ['owner', 'manager', 'cashier', 'waitstaff']
    },
    {
      name: 'Tables',
      href: '/tables',
      icon: Table,
      roles: ['owner', 'manager', 'waitstaff']
    },
    {
      name: 'Kitchen Display',
      href: '/kitchen',
      icon: ChefHat,
      roles: ['owner', 'manager', 'kitchen']
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
      roles: ['owner', 'manager']
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      roles: ['owner', 'manager']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['owner', 'manager']
    }
  ].filter(item => hasRole(item.roles as any));

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary-600 text-white">
            <Store className="h-8 w-8 mr-3" />
            <div>
              <h1 className="text-lg font-bold">Restaurant POS</h1>
              <p className="text-xs opacity-75">Point of Sale System</p>
            </div>
          </div>

          {/* User info */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive(item.href)
                      ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                {isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 mr-2 text-green-500" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 mr-2 text-red-500" />
                    Offline
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              {canAccess('orders', 'read') && (
                <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
              )}

              {/* Quick actions */}
              <div className="flex items-center space-x-4">
                {/* Real-time status */}
                <RealtimeStatus showText={false} />

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;