import React, { useState } from 'react';
import { Settings, Store, User, Bell, CreditCard, Database, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const SettingsPage: React.FC = () => {
  const { user, branch } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: Store },
    { id: 'users', name: 'Users', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'integrations', name: 'Integrations', icon: Database },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  const settingsSections = {
    general: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Restaurant Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Restaurant Name"
              defaultValue={branch?.name || ''}
              placeholder="Enter restaurant name"
            />
            <Input
              label="Phone Number"
              defaultValue={branch?.phone || ''}
              placeholder="Enter phone number"
            />
            <Input
              label="Email Address"
              defaultValue={branch?.email || ''}
              placeholder="Enter email address"
            />
            <Input
              label="Currency"
              defaultValue={branch?.currency || 'USD'}
              placeholder="USD"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tax & Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Tax Rate (%)"
              type="number"
              step="0.01"
              defaultValue={branch?.tax_rate ? branch.tax_rate * 100 : 8}
              placeholder="8.00"
            />
            <Input
              label="Service Charge (%)"
              type="number"
              step="0.01"
              defaultValue="10"
              placeholder="10.00"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Operating Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Opening Time" type="time" defaultValue="09:00" />
              <Input label="Closing Time" type="time" defaultValue="22:00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Days Open
              </label>
              <div className="space-y-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <label key={day} className="flex items-center">
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                    <span className="ml-2 text-sm text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),

    users: (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">User Management</h3>
          <Button icon={<User className="h-4 w-4" />}>Add User</Button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { name: 'John Doe', email: 'john@restaurant.com', role: 'Manager', status: 'Active', lastLogin: '2 hours ago' },
                  { name: 'Jane Smith', email: 'jane@restaurant.com', role: 'Cashier', status: 'Active', lastLogin: '1 day ago' },
                  { name: 'Mike Johnson', email: 'mike@restaurant.com', role: 'Kitchen', status: 'Inactive', lastLogin: '3 days ago' }
                ].map((user, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ),

    notifications: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
          <div className="space-y-4">
            {[
              'Low stock alerts',
              'New order notifications',
              'Payment confirmations',
              'Customer feedback',
              'Daily summary reports',
              'System maintenance alerts'
            ].map((setting) => (
              <label key={setting} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{setting}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="From Email" placeholder="noreply@restaurant.com" />
            <Input label="Reply-to Email" placeholder="support@restaurant.com" />
          </div>
        </div>
      </div>
    ),

    payment: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-4">
            {[
              { name: 'Cash', enabled: true, description: 'Accept cash payments' },
              { name: 'Credit/Debit Cards', enabled: true, description: 'Accept card payments via terminal' },
              { name: 'Mobile Payments', enabled: false, description: 'Accept mobile wallet payments' },
              { name: 'Gift Cards', enabled: true, description: 'Accept gift card payments' }
            ].map((method) => (
              <label key={method.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-700">{method.name}</span>
                  <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={method.enabled}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Terminal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Terminal ID" placeholder="12345678" />
            <Input label="Merchant ID" placeholder="MER123456" />
          </div>
        </div>
      </div>
    ),

    integrations: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Printer Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Receipt Printer" placeholder="EPSON TM-T88V" />
            <Input label="Kitchen Printer" placeholder="Star TSP650II" />
            <Input label="Label Printer" placeholder="Dymo LabelWriter" />
            <Input label="Paper Width" placeholder="80mm" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Scanner Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Enable Barcode Scanner</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
            </label>
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Camera Scanner (Mobile)</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">API Integrations</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Accounting Software</span>
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option>None</option>
                  <option>QuickBooks</option>
                  <option>Xero</option>
                  <option>Wave</option>
                </select>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Inventory Management</span>
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option>None</option>
                  <option>inFlow</option>
                  <option>Fishbowl</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),

    security: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
              <input type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
            </label>
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Require strong passwords</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
            </label>
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Session timeout (minutes)</span>
              <input type="number" defaultValue="30" min="5" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm" />
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Data Backup</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Automatic daily backup</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Backup Time" type="time" defaultValue="02:00" />
              <Input label="Backup Retention (days)" type="number" defaultValue="30" min="1" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Logs</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Log all user activities</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Log Retention (days)" type="number" defaultValue="90" min="1" />
              <Button variant="outline">Download Logs</Button>
            </div>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your restaurant POS configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {settingsSections[activeTab as keyof typeof settingsSections]}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex justify-end space-x-3">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;