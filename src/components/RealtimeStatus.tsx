import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface RealtimeStatusProps {
  className?: string;
  showText?: boolean;
}

/**
 * RealtimeStatus - Shows real-time connection status
 * Displays connection state and allows manual reconnection
 */
export const RealtimeStatus: React.FC<RealtimeStatusProps> = ({
  className = '',
  showText = false
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastConnected, setLastConnected] = useState<Date | null>(null);

  useEffect(() => {
    // Check initial connection status
    const checkConnection = () => {
      const channel = supabase.channel('connection-check');

      channel
        .on('system', {}, (payload) => {
          console.log('System event:', payload);
        })
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
          if (status === 'SUBSCRIBED') {
            setLastConnected(new Date());
          }
        })
        .unsubscribe();
    };

    checkConnection();

    // Set up periodic connection checks
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      // Force reconnect by creating a test channel
      const channel = supabase.channel('reconnect-test');

      await new Promise<void>((resolve) => {
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED' || status === 'CHANNEL_ERROR') {
            setIsConnected(status === 'SUBSCRIBED');
            if (status === 'SUBSCRIBED') {
              setLastConnected(new Date());
            }
            resolve();
          }
        });
      });

      channel.unsubscribe();
    } catch (error) {
      console.error('Reconnection failed:', error);
      setIsConnected(false);
    } finally {
      setIsReconnecting(false);
    }
  };

  const getStatusColor = () => {
    if (isConnected === null) return 'text-gray-500';
    if (isConnected) return 'text-green-500';
    return 'text-red-500';
  };

  const getStatusText = () => {
    if (isConnected === null) return 'Checking...';
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

  const getElapsedTime = () => {
    if (!lastConnected) return '';

    const now = new Date();
    const diff = now.getTime() - lastConnected.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className={cn(
          'transition-colors duration-200',
          getStatusColor(),
          isConnected === false && 'animate-pulse'
        )}>
          {isConnected ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
        </div>

        {isReconnecting && (
          <div className="absolute -top-1 -right-1">
            <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
          </div>
        )}
      </div>

      {showText && (
        <div className="text-xs">
          <div className={cn('font-medium', getStatusColor())}>
            {getStatusText()}
          </div>
          {isConnected && lastConnected && (
            <div className="text-gray-500">
              {getElapsedTime()}
            </div>
          )}
        </div>
      )}

      {!isConnected && (
        <button
          onClick={handleReconnect}
          disabled={isReconnecting}
          className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
          title="Reconnect to real-time updates"
        >
          {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
        </button>
      )}
    </div>
  );
};

export default RealtimeStatus;