import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Users, Clock, Calendar, Plus, Edit, CheckCircle, AlertCircle, Users2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { tableService, orderService } from '../lib/supabase';
import { RestaurantTable, Order, TableStatus } from '../types';

// Components
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

const statusConfig = {
  available: {
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    label: 'Available'
  },
  occupied: {
    color: 'bg-red-100 text-red-800',
    icon: Users2,
    label: 'Occupied'
  },
  reserved: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    label: 'Reserved'
  },
  cleaning: {
    color: 'bg-blue-100 text-blue-800',
    icon: AlertCircle,
    label: 'Cleaning'
  }
};

export const TableManagementPage: React.FC = () => {
  const { branch } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<TableStatus | 'all'>('all');
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  // Load tables
  const { data: tables = [], isLoading, refetch } = useQuery(
    'tables',
    () => tableService.getByBranch(branch?.id || ''),
    {
      enabled: !!branch?.id
    }
  );

  // Load active orders for tables
  const { data: activeOrders = [] } = useQuery(
    'active-table-orders',
    () => orderService.getByBranch(branch?.id || '', 'pending').then(orders =>
      orders.filter((order: Order) => order.table_id)
    ),
    {
      enabled: !!branch?.id
    }
  );

  // Filter tables by status
  const filteredTables = tables.filter((table: RestaurantTable) => {
    if (selectedStatus === 'all') return true;
    return table.status === selectedStatus;
  });

  // Check if table has active orders
  const hasActiveOrder = (tableId: string) => {
    return activeOrders.some((order: Order) => order.table_id === tableId);
  };

  // Get order info for table
  const getTableOrderInfo = (tableId: string) => {
    const order = activeOrders.find((order: Order) => order.table_id === tableId);
    if (!order) return null;

    return {
      orderNo: order.order_no,
      customerCount: order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0,
      total: order.total,
      timeElapsed: Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60)) // minutes
    };
  };

  const handleTableAction = (table: RestaurantTable, action: string) => {
    switch (action) {
      case 'assign':
        // Navigate to POS with table selected
        window.location.href = `/pos?tableId=${table.id}`;
        break;
      case 'view':
        // View table details
        setSelectedTable(table);
        break;
      case 'order':
        // Navigate to POS for this table
        window.location.href = `/pos?tableId=${table.id}`;
        break;
      case 'mark-clean':
        // Update table status to cleaning
        tableService.updateStatus(table.id, 'cleaning').then(() => {
          refetch();
        });
        break;
      case 'make-available':
        // Update table status to available
        tableService.updateStatus(table.id, 'available').then(() => {
          refetch();
        });
        break;
      default:
        break;
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
        <p className="text-gray-600">Manage restaurant tables and reservations</p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as TableStatus | 'all')}
              options={[
                { value: 'all', label: 'All Tables' },
                { value: 'available', label: 'Available' },
                { value: 'occupied', label: 'Occupied' },
                { value: 'reserved', label: 'Reserved' },
                { value: 'cleaning', label: 'Cleaning' }
              ]}
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={() => setShowReservationModal(true)}
            icon={<Calendar className="h-4 w-4" />}
          >
            New Reservation
          </Button>
          <Button
            variant="outline"
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {(['available', 'occupied', 'reserved', 'cleaning'] as TableStatus[]).map((status) => {
          const count = tables.filter((table: RestaurantTable) => table.status === status).length;
          const config = statusConfig[status];
          const Icon = config.icon;

          return (
            <div key={status} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600">{config.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tables Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Tables ({filteredTables.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading tables...</p>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tables found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {filteredTables.map((table: RestaurantTable) => {
              const statusConfigItem = statusConfig[table.status];
              const StatusIcon = statusConfigItem.icon;
              const orderInfo = getTableOrderInfo(table.id);
              const hasOrder = hasActiveOrder(table.id);

              return (
                <div key={table.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Table {table.table_no}
                      </h3>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfigItem.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfigItem.label}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {table.capacity} seats
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  {orderInfo && (
                    <div className="bg-blue-50 rounded p-2 mb-3">
                      <div className="text-sm font-medium text-blue-900">
                        Order #{orderInfo.orderNo}
                      </div>
                      <div className="text-xs text-blue-700">
                        {orderInfo.customerCount} items • ${orderInfo.total.toFixed(2)}
                      </div>
                      <div className="text-xs text-blue-600">
                        {formatTime(orderInfo.timeElapsed)} elapsed
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {table.location && (
                    <div className="text-xs text-gray-500 mb-3">
                      {table.location}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {table.status === 'available' && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleTableAction(table, 'assign')}
                      >
                        Assign to Customer
                      </Button>
                    )}

                    {table.status === 'occupied' && orderInfo && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleTableAction(table, 'order')}
                      >
                        View Order
                      </Button>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleTableAction(table, 'view')}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>

                      {table.status === 'occupied' && !orderInfo && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleTableAction(table, 'mark-clean')}
                        >
                          Mark Clean
                        </Button>
                      )}

                      {table.status === 'cleaning' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleTableAction(table, 'make-available')}
                        >
                          Available
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      <Modal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        title="Create Reservation"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Table
            </label>
            <Select
              options={tables
                .filter((t: RestaurantTable) => t.status === 'available')
                .map((t: RestaurantTable) => ({
                  value: t.id,
                  label: `Table ${t.table_no} (${t.capacity} seats)`
                }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reservation Time
            </label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Guests
            </label>
            <input
              type="number"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter number of guests"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowReservationModal(false)}
            >
              Cancel
            </Button>
            <Button>
              Create Reservation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TableManagementPage;