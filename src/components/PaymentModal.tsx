import React, { useState } from 'react';
import { DollarSign, CreditCard, Smartphone, Star, Calculator, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { branch } = useAuth();
  const { cart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'points'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [tip, setTip] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateChange = () => {
    if (!cashReceived) return 0;
    const total = cart.total + parseFloat(tip || '0');
    return parseFloat(cashReceived) - total;
  };

  const calculateTotalWithTip = () => {
    return cart.total + parseFloat(tip || '0');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: branch?.currency || 'USD'
    }).format(amount);
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onComplete();
    }, 2000);
  };

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Cash',
      icon: DollarSign,
      description: 'Pay with cash'
    },
    {
      id: 'card',
      name: 'Card',
      icon: CreditCard,
      description: 'Credit/Debit card'
    },
    {
      id: 'mobile',
      name: 'Mobile',
      icon: Smartphone,
      description: 'Mobile wallet'
    },
    {
      id: 'points',
      name: 'Loyalty Points',
      icon: Star,
      description: 'Use loyalty points'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Payment</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Order Summary */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Order Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatCurrency(cart.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Charge</span>
                  <span>{formatCurrency(cart.service_charge)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(cart.discount)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary-600">{formatCurrency(cart.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-sm">{method.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Details */}
            <div className="mb-6">
              {paymentMethod === 'cash' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cash Received
                    </label>
                    <Input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00"
                      icon={<DollarSign className="h-5 w-5" />}
                    />
                  </div>

                  {cashReceived && calculateChange() > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">Change</span>
                        <span className="text-lg font-semibold text-green-800">
                          {formatCurrency(calculateChange())}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Insert or swipe card</p>
                  <p className="text-xs text-gray-500 mt-1">Terminal will process payment</p>
                </div>
              )}

              {paymentMethod === 'mobile' && (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Scan QR code with mobile wallet</p>
                </div>
              )}

              {paymentMethod === 'points' && cart.customer && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-yellow-800">Available Points</span>
                    <span className="font-semibold text-yellow-800">{cart.customer.points}</span>
                  </div>
                  <div className="text-xs text-yellow-700">
                    Each point = $0.01 value
                  </div>
                </div>
              )}
            </div>

            {/* Tip */}
            {(paymentMethod === 'card' || paymentMethod === 'mobile') && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tip (Optional)
                </label>
                <div className="flex space-x-2">
                  {[15, 18, 20, 25].map((percentage) => (
                    <button
                      key={percentage}
                      onClick={() => setTip((cart.total * percentage / 100).toString())}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        tip && Math.round(parseFloat(tip) / cart.total * 100) === percentage
                          ? 'border-primary-500 bg-primary-50 text-primary-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {percentage}%
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={tip}
                  onChange={(e) => setTip(e.target.value)}
                  placeholder="Custom tip amount"
                  className="mt-2"
                  icon={<DollarSign className="h-5 w-5" />}
                />
              </div>
            )}

            {/* Total with Tip */}
            {(paymentMethod === 'card' || paymentMethod === 'mobile') && tip && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">Total with Tip</span>
                  <span className="text-lg font-semibold text-blue-800">
                    {formatCurrency(calculateTotalWithTip())}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handlePayment}
                loading={isProcessing}
                disabled={paymentMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < cart.total)}
              >
                {isProcessing ? 'Processing...' : 'Complete Payment'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;