import { useState, useCallback, useContext, createContext, useEffect } from 'react';
import { Cart, CartItem, Product, Customer } from '../types';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity?: number, modifiers?: Array<{name: string, price: number}>, notes?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomer: (customer: Customer | undefined) => void;
  setSpecialRequests: (requests: string | undefined) => void;
  applyDiscount: (amount: number) => void;
  calculateTotals: () => { subtotal: number; tax: number; service_charge: number; total: number };
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
  taxRate?: number;
  serviceChargeRate?: number;
}

export const CartProvider: React.FC<CartProviderProps> = ({
  children,
  taxRate = 0.08,
  serviceChargeRate = 0.10
}) => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    tax: 0,
    service_charge: 0,
    discount: 0,
    total: 0,
  });

  // Calculate totals whenever cart items change
  useEffect(() => {
    const { subtotal, tax, service_charge, total } = calculateTotals();
    setCart(prev => ({
      ...prev,
      subtotal,
      tax,
      service_charge,
      total
    }));
  }, [cart.items, cart.discount]);

  const calculateTotals = useCallback(() => {
    const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * taxRate;
    const service_charge = subtotal * serviceChargeRate;
    const total = subtotal + tax + service_charge - cart.discount;

    return {
      subtotal,
      tax,
      service_charge,
      total
    };
  }, [cart.items, cart.discount, taxRate, serviceChargeRate]);

  const addToCart = useCallback((
    product: Product,
    quantity: number = 1,
    modifiers: Array<{name: string, price: number}> = [],
    notes?: string
  ) => {
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      toast.error(`Insufficient stock. Only ${product.stock} available.`);
      return;
    }

    setCart(prev => {
      const existingItemIndex = prev.items.findIndex(
        item => item.product.id === product.id &&
        JSON.stringify(item.modifiers) === JSON.stringify(modifiers)
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item
        const existingItem = prev.items[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;

        if (product.stock < newQuantity) {
          toast.error(`Insufficient stock. Only ${product.stock} available.`);
          return prev;
        }

        newItems = [...prev.items];
        const currentModifierTotal = existingItem.modifiers.reduce((sum, mod) => sum + mod.price, 0);
        const unitPrice = existingItem.product.price;
        newItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          subtotal: (unitPrice + currentModifierTotal) * newQuantity
        };
      } else {
        // Add new item
        const unitPrice = product.price;
        const modifierTotal = modifiers.reduce((sum, mod) => sum + mod.price, 0);
        const subtotal = (unitPrice + modifierTotal) * quantity;

        newItems = [...prev.items, {
          product,
          quantity,
          modifiers,
          notes,
          subtotal
        }];
      }

      return {
        ...prev,
        items: newItems
      };
    });

    toast.success(`Added ${product.name} to cart`);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.product.id !== productId)
    }));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => {
      const itemIndex = prev.items.findIndex(item => item.product.id === productId);

      if (itemIndex === -1) return prev;

      const item = prev.items[itemIndex];

      // Check stock
      if (item.product.stock < quantity) {
        toast.error(`Insufficient stock. Only ${item.product.stock} available.`);
        return prev;
      }

      const newItems = [...prev.items];
      const modifierTotal = item.modifiers.reduce((sum, mod) => sum + mod.price, 0);
      const unitPrice = item.product.price;
      newItems[itemIndex] = {
        ...item,
        quantity,
        subtotal: (unitPrice + modifierTotal) * quantity
      };

      return {
        ...prev,
        items: newItems
      };
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      subtotal: 0,
      tax: 0,
      service_charge: 0,
      discount: 0,
      total: 0,
      customer: undefined,
      special_requests: undefined
    });
  }, []);

  const setCustomer = useCallback((customer: Customer | undefined) => {
    setCart(prev => ({
      ...prev,
      customer
    }));
  }, []);

  const setSpecialRequests = useCallback((requests: string | undefined) => {
    setCart(prev => ({
      ...prev,
      special_requests: requests
    }));
  }, []);

  const applyDiscount = useCallback((amount: number) => {
    if (amount < 0) {
      toast.error('Discount cannot be negative');
      return;
    }

    const { subtotal } = calculateTotals();
    if (amount > subtotal) {
      toast.error('Discount cannot exceed subtotal');
      return;
    }

    setCart(prev => ({
      ...prev,
      discount: amount
    }));

    toast.success(`$${amount.toFixed(2)} discount applied`);
  }, [calculateTotals]);

  const getTotalItems = useCallback(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart.items]);

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCustomer,
    setSpecialRequests,
    applyDiscount,
    calculateTotals,
    getTotalItems
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Utility hook for cart item operations
export const useCartItem = (productId: string) => {
  const { cart, updateQuantity, removeFromCart } = useCart();

  const item = cart.items.find(item => item.product.id === productId);

  const increment = useCallback(() => {
    if (item) {
      updateQuantity(productId, item.quantity + 1);
    }
  }, [item, productId, updateQuantity]);

  const decrement = useCallback(() => {
    if (item && item.quantity > 1) {
      updateQuantity(productId, item.quantity - 1);
    } else if (item) {
      removeFromCart(productId);
    }
  }, [item, productId, updateQuantity, removeFromCart]);

  const setQuantity = useCallback((quantity: number) => {
    updateQuantity(productId, quantity);
  }, [productId, updateQuantity]);

  return {
    item,
    increment,
    decrement,
    setQuantity,
    isInCart: !!item
  };
};