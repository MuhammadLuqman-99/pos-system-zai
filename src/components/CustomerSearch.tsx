import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Search, Users, Plus, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { customerService } from '../lib/supabase';
import { Customer } from '../types';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface CustomerSearchProps {
  onSelect: (customer: Customer) => void;
  onClose: () => void;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({ onSelect, onClose }) => {
  const { branch } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Search customers
  const { data: customersData, isLoading } = useQuery(
    ['customers', searchQuery],
    () => customerService.search(searchQuery, branch?.id),
    {
      enabled: searchQuery.length >= 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const customers = customersData?.data || [];

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    onSelect(customer);
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getLoyaltyTier = (points: number) => {
    if (points >= 1500) return { name: 'Gold', color: 'bg-yellow-100 text-yellow-800' };
    if (points >= 500) return { name: 'Silver', color: 'bg-gray-100 text-gray-800' };
    return { name: 'Bronze', color: 'bg-orange-100 text-orange-800' };
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div>
        <Input
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="h-5 w-5" />}
          autoFocus
        />
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {/* Handle new customer */}}
        >
          New Customer
        </Button>
        <Button
          variant="outline"
          onClick={() => setSearchQuery('')}
          disabled={!searchQuery}
        >
          Clear Search
        </Button>
      </div>

      {/* Search Results */}
      {isLoading && searchQuery.length >= 2 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Searching customers...</p>
        </div>
      ) : searchQuery.length >= 2 && customers.length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {customers.map((customer: Customer) => {
            const tier = getLoyaltyTier(customer.points);
            return (
              <div
                key={customer.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSelect(customer)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {customer.name || 'Unknown Customer'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${tier.color}`}>
                        {tier.name}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      {customer.phone && (
                        <div>{formatPhone(customer.phone)}</div>
                      )}
                      {customer.email && (
                        <div>{customer.email}</div>
                      )}
                      <div className="flex items-center space-x-4 text-xs">
                        <span>{customer.visits} visits</span>
                        <span>${customer.total_spent.toFixed(2)} spent</span>
                        <span>{customer.points} points</span>
                      </div>
                    </div>

                    {customer.notes && (
                      <div className="mt-2 text-xs text-gray-500 italic">
                        {customer.notes}
                      </div>
                    )}
                  </div>

                  <Users className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                </div>
              </div>
            );
          })}
        </div>
      ) : searchQuery.length >= 2 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No customers found</p>
          <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Type to search customers</p>
          <p className="text-sm text-gray-400 mt-1">Search by name, phone number, or email</p>
        </div>
      )}

      {/* Selected Customer Display */}
      {selectedCustomer && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">
                Selected: {selectedCustomer.name}
              </p>
              <p className="text-xs text-green-600">
                {selectedCustomer.points} loyalty points
              </p>
            </div>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Recent Customers */}
      {searchQuery.length === 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Customers</h3>
          <div className="space-y-2">
            {[
              { name: 'John Doe', phone: '(555) 123-4567', points: 1250, tier: 'Silver' },
              { name: 'Jane Smith', phone: '(555) 987-6543', points: 320, tier: 'Bronze' },
              { name: 'Bob Johnson', phone: '(555) 246-8135', points: 2100, tier: 'Gold' }
            ].map((customer, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSelect(customer as any)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{customer.name}</h4>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                    customer.tier === 'Silver' ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {customer.points} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        {selectedCustomer && (
          <Button onClick={() => {
            onSelect(selectedCustomer);
            onClose();
          }}>
            Select Customer
          </Button>
        )}
      </div>
    </div>
  );
};

export default CustomerSearch;