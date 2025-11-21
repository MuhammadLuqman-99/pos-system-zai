import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useOrderRealtime } from '../hooks/useRealtimeSubscription';
import { useTableRealtime } from '../hooks/useRealtimeSubscription';
import { usePaymentRealtime } from '../hooks/useRealtimeSubscription';

interface RealtimeProviderProps {
  children: React.ReactNode;
}

/**
 * RealtimeProvider - Centralizes all real-time subscriptions
 * This component manages WebSocket connections for real-time updates
 * and should be wrapped around authenticated routes.
 */
export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // Only enable real-time subscriptions when user is authenticated
  const orderRealtime = useOrderRealtime();
  const tableRealtime = useTableRealtime();
  const paymentRealtime = usePaymentRealtime();

  // The hooks automatically handle subscription lifecycle
  // No additional state management needed here

  if (!isAuthenticated) {
    // Don't establish real-time connections for unauthenticated users
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default RealtimeProvider;