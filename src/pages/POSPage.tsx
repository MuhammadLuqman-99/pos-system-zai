import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Search, Camera, X, Plus, Minus, Receipt, CreditCard, Smartphone, Star, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { usePOSShortcuts } from '../hooks/useKeyboardShortcuts';
import { categoryService, productService, customerService } from '../lib/supabase';
import { Category, Product, Customer } from '../types';

// Components
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import BarcodeScanner from '../components/BarcodeScanner';
import PaymentModal from '../components/PaymentModal';
import CustomerSearch from '../components/CustomerSearch';

export const POSPage: React.FC = () => {
  const { user, branch, canAccess } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, setCustomer, setSpecialRequests } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);

  // Load categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery(
    'categories',
    () => categoryService.getByBranch(branch?.id || ''),
    {
      enabled: !!branch?.id
    }
  );

  // Load products
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery(
    ['products', selectedCategory, searchQuery],
    () => {
      if (selectedCategory) {
        return productService.getByCategory(selectedCategory, branch?.id);
      } else if (searchQuery) {
        return productService.search(searchQuery, branch?.id);
      } else {
        return productService.getByBranch(branch?.id);
      }
    },
    {
      enabled: !!branch?.id
    }
  );

  // Handle keyboard shortcuts
  usePOSShortcuts({
    onPayment: () => {
      if (cart.items.length > 0) {
        setShowPaymentModal(true);
      }
    },
    onCustomerSearch: () => setShowCustomerSearch(true),
    onBarcodeScan: () => setShowBarcodeScanner(!showBarcodeScanner),
    onClearCart: () => {
      if (cart.items.length > 0 && window.confirm('Clear entire cart?')) {
        clearCart();
      }
    }
  });

  // Barcode scanning handler
  const handleBarcodeScan = async (barcode: string) => {
    try {
      const { data: product, error } = await productService.getByBarcode(barcode, branch?.id);
      if (product) {
        addToCart(product);
        setShowBarcodeScanner(false);
      } else {
        alert('Product not found for this barcode');
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      alert('Error scanning barcode');
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    setCustomer(customer);
    setShowCustomerSearch(false);
  };

  // Get product image URL
  const getProductImageUrl = (product: Product) => {
    if (product.image_url) {
      return product.image_url;
    }
    // Fallback to category image or placeholder
    return 'https://via.placeholder.com/200x150?text=No+Image';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: branch?.currency || 'USD'
    }).format(price);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Point of Sale</h1>
            {selectedTable && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                Table {selectedTable.table_no}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-5 w-5" />}
              className="w-64"
            />

            <Button
              variant="outline"
              onClick={() => setShowBarcodeScanner(!showBarcodeScanner)}
              icon={<Camera className="h-4 w-4" />}
            >
              Scanner
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Categories & Products */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Categories */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  !selectedCategory
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Products
              </button>
              {categories.map((category: Category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            {productsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((product: any) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => addToCart(product.product || product)}
                  >
                    <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-t-lg overflow-hidden">
                      <img
                        src={getProductImageUrl(product.product || product)}
                        alt={product.product?.name || product.name}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {product.product?.name || product.name}
                      </h3>
                      <p className="text-gray-500 text-xs truncate">
                        {product.product?.description || product.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-primary-600">
                          {formatPrice(product.product?.price || product.price)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          (product.product?.stock || product.stock) > (product.product?.min_stock || 0)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          Stock: {product.product?.stock || product.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Cart */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                icon={<X className="h-4 w-4" />}
                disabled={cart.items.length === 0}
              >
                Clear
              </Button>
            </div>

            {/* Customer Info */}
            <div className="flex items-center justify-between">
              {cart.customer ? (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {cart.customer.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {cart.customer.points} points
                  </span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomerSearch(true)}
                  icon={<Users className="h-4 w-4" />}
                >
                  Add Customer
                </Button>
              )}

              {selectedTable ? (
                <div className="text-sm text-gray-600">
                  Table {selectedTable.table_no}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {/* Show table selection */}}
                >
                  Select Table
                </Button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.items.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">Add products to start</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.product.name}
                        </h4>
                        {item.modifiers.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.modifiers.map(mod => mod.name).join(', ')}
                          </div>
                        )}
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <div className="border-t border-gray-200 p-4 space-y-3">
            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
                placeholder="Any special requests..."
                value={cart.special_requests || ''}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />
            </div>

            {/* Totals */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({(branch?.tax_rate || 8) * 100}%)</span>
                <span className="font-medium">{formatPrice(cart.tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service Charge</span>
                <span className="font-medium">{formatPrice(cart.service_charge)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary-600">{formatPrice(cart.total)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {/* Show discount modal */}}
                disabled={cart.items.length === 0}
              >
                Discount
              </Button>
              <Button
                className="flex-1"
                onClick={() => setShowPaymentModal(true)}
                disabled={cart.items.length === 0}
              >
                Payment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <Modal
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        title="Barcode Scanner"
        size="md"
      >
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowBarcodeScanner(false)}
        />
      </Modal>

      {/* Customer Search Modal */}
      <Modal
        isOpen={showCustomerSearch}
        onClose={() => setShowCustomerSearch(false)}
        title="Search Customer"
        size="lg"
      >
        <CustomerSearch
          onSelect={handleCustomerSelect}
          onClose={() => setShowCustomerSearch(false)}
        />
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onComplete={() => {
          setShowPaymentModal(false);
          clearCart();
        }}
      />
    </div>
  );
};

export default POSPage;