import React from 'react';
import { useQuery } from 'react-query';
import { ChefHat, Clock, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getKitchenOrders } from '../lib/supabase';
import { Order } from '../types';

export const KitchenDisplayPage: React.FC = () => {
  const { branch } = useAuth();

  const { data: kitchenOrders = [], isLoading, refetch } = useQuery(
    'kitchen-orders',
    () => getKitchenOrders(branch?.id || ''),
    {
      enabled: !!branch?.id,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'vip':
        return <Star className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ChefHat className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kitchen Display</h1>
            <p className="text-gray-600">Active orders and preparation status</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Auto-refresh every 30 seconds
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading kitchen orders...</p>
        </div>
      ) : kitchenOrders.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active orders</h3>
          <p className="text-gray-500">All orders have been completed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {kitchenOrders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-lg shadow-lg border-l-4 border-primary-600">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    Order #{order.order_no}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {getPriorityIcon(order.priority)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>Table: {order.table_no || 'Takeaway'}</span>
                    <span>Items: {order.items?.length || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(order.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-3">
                  {order.items?.map((item: any, index: number) => (
                    <div key={index} className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {item.quantity}x {item.product_name}
                          </span>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <span className="text-xs text-gray-500">
                              ({item.modifiers.map((m: any) => m.name).join(', ')})
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.status === 'ready' ? 'bg-green-100 text-green-800' :
                          item.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {order.special_requests && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">
                      Special Request:
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {order.special_requests}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex space-x-2">
                  <button
                    className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                    onClick={() => {/* Update item status to preparing */}}
                  >
                    Start Preparing
                  </button>
                  <button
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    onClick={() => {/* Update item status to ready */}}
                  >
                    Mark Ready
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KitchenDisplayPage;