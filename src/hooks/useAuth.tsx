import { useState, useEffect, useContext, createContext } from 'react';
import { User, Branch, UserRole } from '../types';
import { supabase, getCurrentUser, signOut } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  branch: Branch | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  selectBranch: (branch: Branch) => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  canAccess: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Get user details from our users table
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email!)
            .single();

          if (userData) {
            setUser(userData);

            // Load user's branch if they have one assigned
            if (userData.branch_id) {
              const { data: branchData } = await supabase
                .from('branches')
                .select('*')
                .eq('id', userData.branch_id)
                .single();

              setBranch(branchData);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email!)
            .single();

          if (userData) {
            setUser(userData);

            if (userData.branch_id) {
              const { data: branchData } = await supabase
                .from('branches')
                .select('*')
                .eq('id', userData.branch_id)
                .single();

              setBranch(branchData);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setBranch(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      // Get user details from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        toast.error('User profile not found');
        await supabase.auth.signOut();
        return false;
      }

      if (!userData.is_active) {
        toast.error('Account is deactivated');
        await supabase.auth.signOut();
        return false;
      }

      setUser(userData);

      // Load user's branch if they have one assigned
      if (userData.branch_id) {
        const { data: branchData } = await supabase
          .from('branches')
          .select('*')
          .eq('id', userData.branch_id)
          .single();

        setBranch(branchData);
      }

      toast.success('Welcome back!');
      return true;

    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut();
      setUser(null);
      setBranch(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const selectBranch = (selectedBranch: Branch) => {
    setBranch(selectedBranch);
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }

    return user.role === role;
  };

  const canAccess = (resource: string, action: string): boolean => {
    if (!user) return false;

    // Owner has access to everything
    if (user.role === 'owner') return true;

    // Manager permissions
    if (user.role === 'manager') {
      const managerAllowed = [
        'products.create', 'products.read', 'products.update',
        'orders.create', 'orders.read', 'orders.update',
        'customers.create', 'customers.read', 'customers.update',
        'reports.read', 'tables.read', 'tables.update',
        'users.read', 'users.update', 'payments.create', 'payments.read'
      ];
      return managerAllowed.includes(`${resource}.${action}`);
    }

    // Cashier permissions
    if (user.role === 'cashier') {
      const cashierAllowed = [
        'orders.create', 'orders.read', 'orders.update',
        'customers.read', 'customers.create',
        'payments.create', 'payments.read',
        'products.read', 'tables.read', 'tables.update'
      ];
      return cashierAllowed.includes(`${resource}.${action}`);
    }

    // Kitchen staff permissions
    if (user.role === 'kitchen') {
      const kitchenAllowed = [
        'orders.read', 'orders.update', // for status updates
        'products.read', // for viewing ingredients
        'stock_movements.create', 'stock_movements.read'
      ];
      return kitchenAllowed.includes(`${resource}.${action}`);
    }

    // Waitstaff permissions
    if (user.role === 'waitstaff') {
      const waitstaffAllowed = [
        'orders.create', 'orders.read', 'orders.update',
        'tables.read', 'tables.update',
        'customers.read', 'customers.create',
        'payments.create', 'payments.read',
        'products.read'
      ];
      return waitstaffAllowed.includes(`${resource}.${action}`);
    }

    return false;
  };

  const value: AuthContextType = {
    user,
    branch,
    loading,
    isAuthenticated: !!user,
    signIn,
    signOut: signOutUser,
    selectBranch,
    hasRole,
    canAccess
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Utility component for role-based rendering
interface RoleGuardProps {
  roles: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  roles,
  children,
  fallback = null
}) => {
  const { hasRole } = useAuth();

  if (hasRole(roles)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

// Permission guard component
interface PermissionGuardProps {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  action,
  children,
  fallback = null
}) => {
  const { canAccess } = useAuth();

  if (canAccess(resource, action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};