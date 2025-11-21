import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Download, Filter } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getDailySalesReport, getPopularItems, getInventoryReport } from '../lib/supabase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// Components
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';

export const ReportsPage: React.FC = () => {
  const { branch } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedReport, setSelectedReport] = useState('sales');

  // Generate sample data for charts
  const salesData = [
    { hour: '9am', sales: 0 },
    { hour: '10am', sales: 450 },
    { hour: '11am', sales: 890 },
    { hour: '12pm', sales: 2340 },
    { hour: '1pm', sales: 1890 },
    { hour: '2pm', sales: 1230 },
    { hour: '3pm', sales: 890 },
    { hour: '4pm', sales: 670 },
    { hour: '5pm', sales: 2340 },
    { hour: '6pm', sales: 3560 },
    { hour: '7pm', sales: 4230 },
    { hour: '8pm', sales: 3120 },
    { hour: '9pm', sales: 1890 },
    { hour: '10pm', sales: 780 }
  ];

  const popularItems = [
    { name: 'Burger Deluxe', orders: 156, revenue: 2027.94 },
    { name: 'Pizza Margherita', orders: 134, revenue: 2145.66 },
    { name: 'Caesar Salad', orders: 89, revenue: 800.11 },
    { name: 'Craft Beer', orders: 245, revenue: 1102.50 },
    { name: 'Fries', orders: 198, revenue: 1188.00 }
  ];

  const inventoryData = [
    { name: 'Burger Deluxe', stock: 45, minStock: 10, status: 'Good' },
    { name: 'Pizza Margherita', stock: 8, minStock: 15, status: 'Low' },
    { name: 'Caesar Salad', stock: 32, minStock: 20, status: 'Good' },
    { name: 'Craft Beer', stock: 3, minStock: 24, status: 'Low' },
    { name: 'Fries', stock: 156, minStock: 50, status: 'Good' }
  ];

  const metrics = {
    totalSales: 2847.56,
    orderCount: 126,
    averageOrder: 22.60,
    customerCount: 89,
    staffCount: 8,
    inventoryValue: 4567.89
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: branch?.currency || 'USD'
    }).format(amount);
  };

  const MetricCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color || 'text-gray-900'}`}>
            {typeof value === 'number' && title.includes('$') ? formatCurrency(value) : value}
          </p>
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color ? color.replace('text', 'bg').replace('600', '100') : 'bg-gray-100'}`}>
          <Icon className={`h-6 w-6 ${color || 'text-gray-600'}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BarChart3 className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Business insights and performance metrics</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              options={[
                { value: 'today', label: 'Today' },
                { value: 'yesterday', label: 'Yesterday' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'year', label: 'This Year' }
              ]}
            />
          </div>
          <Button variant="outline" icon={<Download className="h-4 w-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <MetricCard
          title="Total Sales"
          value={metrics.totalSales}
          icon={DollarSign}
          trend={12.3}
          color="text-green-600"
        />
        <MetricCard
          title="Orders"
          value={metrics.orderCount}
          icon={BarChart3}
          trend={8.1}
          color="text-blue-600"
        />
        <MetricCard
          title="Avg Order"
          value={metrics.averageOrder}
          icon={TrendingUp}
          trend={-2.4}
          color="text-purple-600"
        />
        <MetricCard
          title="Customers"
          value={metrics.customerCount}
          icon={Users}
          trend={15.2}
          color="text-orange-600"
        />
        <MetricCard
          title="Staff"
          value={metrics.staffCount}
          icon={Users}
          trend={0}
          color="text-indigo-600"
        />
        <MetricCard
          title="Inventory Value"
          value={metrics.inventoryValue}
          icon={DollarSign}
          trend={5.7}
          color="text-yellow-600"
        />
      </div>

      {/* Report Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {['sales', 'popular', 'inventory', 'staff'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedReport(tab)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm capitalize
                  ${selectedReport === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab === 'sales' ? 'Sales Report' :
                 tab === 'popular' ? 'Popular Items' :
                 tab === 'inventory' ? 'Inventory' : 'Staff Performance'}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Sales Chart */}
          {selectedReport === 'sales' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Hour</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Popular Items */}
          {selectedReport === 'popular' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={popularItems}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {popularItems.slice(0, 3).map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.orders} orders</p>
                    <p className="font-semibold text-green-600">{formatCurrency(item.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Report */}
          {selectedReport === 'inventory' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Min Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventoryData.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.minStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'Good'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Staff Performance */}
          {selectedReport === 'staff' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Today's Performance</h4>
                  <div className="space-y-2">
                    {['John Cashier', 'Sarah Waitstaff', 'Mike Kitchen'].map((staff, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{staff}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">Orders: {23 - index * 3}</span>
                          <span className="text-sm font-medium text-green-600">
                            ${formatCurrency(450 - index * 50)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Weekly Averages</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Average Orders/Hour</span>
                      <span className="font-semibold">4.2</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Average Sale Value</span>
                      <span className="font-semibold">{formatCurrency(28.50)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Customer Satisfaction</span>
                      <span className="font-semibold text-green-600">4.7/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">On-time Delivery</span>
                      <span className="font-semibold">92%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" icon={<Filter className="h-4 w-4" />}>
            Custom Reports
          </Button>
          <Button variant="outline" icon={<Calendar className="h-4 w-4" />}>
            Schedule Reports
          </Button>
          <Button variant="outline" icon={<Download className="h-4 w-4" />}>
            Export to CSV
          </Button>
          <Button variant="outline" icon={<Download className="h-4 w-4" />}>
            Export to PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;