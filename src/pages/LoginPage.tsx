import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, Store, Wifi, WifiOff } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { signIn, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    branchId: ''
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const success = await signIn(formData.email, formData.password);
    if (!success) {
      setErrors({ general: 'Invalid email or password' });
    }
  };

  const handleQuickLogin = async (email: string, password: string) => {
    const success = await signIn(email, password);
    if (!success) {
      setErrors({ general: 'Quick login failed' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center">
            <Store className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Restaurant POS
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your point of sale system
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-center space-x-2">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">Offline - Limited functionality</span>
            </>
          )}
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            <Input
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<Mail className="h-5 w-5" />}
              placeholder="Enter your email"
              required
              disabled={!isOnline}
            />

            <Input
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={<Lock className="h-5 w-5" />}
              placeholder="Enter your password"
              required
              disabled={!isOnline}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 block text-sm text-gray-700">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                className="text-sm text-primary-600 hover:text-primary-500"
                onClick={() => {/* Handle forgot password */}}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={!isOnline}
            >
              Sign In
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center mb-4">
              Demo Accounts (for testing)
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleQuickLogin('owner@restaurant.com', 'password123')}
                disabled={!isOnline}
              >
                Owner Access
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleQuickLogin('manager@restaurant.com', 'password123')}
                disabled={!isOnline}
              >
                Manager Access
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleQuickLogin('cashier@restaurant.com', 'password123')}
                disabled={!isOnline}
              >
                Cashier Access
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 Restaurant POS System</p>
          <p className="mt-1">
            Version 1.0.0 | Need help?{' '}
            <button className="text-primary-600 hover:text-primary-500">
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;