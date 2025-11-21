import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';

import { paymentService, orderService, activityLogService } from '../lib/supabase';
import { Payment, PaymentMethod, PaymentStatus } from '../types';
import { useAuth } from './useAuth';
import { formatCurrency, calculateTotal } from '../lib/utils';

interface ProcessPaymentData {
  order_id: string;
  amount: number;
  method: PaymentMethod;
  customer_payment_method_id?: string;
  reference_number?: string;
  tips?: number;
}

export const usePayment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Process payment
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: ProcessPaymentData) => {
      // Create payment record
      const { data: payment, error: paymentError } = await paymentService.processPayment({
        ...paymentData,
        branch_id: user?.branch_id,
        staff_id: user?.id,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      if (paymentError) throw paymentError;

      // Process payment with payment gateway (this would be actual Stripe integration)
      try {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update payment status to completed
        const { data: updatedPayment, error: updateError } = await paymentService.updateStatus(
          payment.id,
          'completed',
          `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        );

        if (updateError) throw updateError;

        // Update order status to completed if fully paid
        await orderService.update(paymentData.order_id, {
          status: 'completed',
          updated_at: new Date().toISOString(),
        });

        // Log activity
        await activityLogService.logActivity({
          user_id: user?.id,
          branch_id: user?.branch_id,
          action: 'payment_processed',
          resource_type: 'payment',
          resource_id: updatedPayment.id,
          details: `Payment processed: ${formatCurrency(paymentData.amount)} via ${paymentData.method}`,
        });

        return updatedPayment;

      } catch (processingError) {
        // Update payment status to failed
        await paymentService.updateStatus(payment.id, 'failed');

        // Log failed payment
        await activityLogService.logActivity({
          user_id: user?.id,
          branch_id: user?.branch_id,
          action: 'payment_failed',
          resource_type: 'payment',
          resource_id: payment.id,
          details: `Payment failed: ${formatCurrency(paymentData.amount)} via ${paymentData.method}`,
        });

        throw processingError;
      }
    },
    onSuccess: (payment) => {
      toast.success(`Payment of ${formatCurrency(payment.amount)} processed successfully`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (error) => {
      toast.error('Payment processing failed. Please try again.');
      console.error('Payment processing error:', error);
    },
  });

  // Refund payment
  const refundPaymentMutation = useMutation({
    mutationFn: async ({
      paymentId,
      amount,
      reason,
    }: {
      paymentId: string;
      amount: number;
      reason: string;
    }) => {
      // Get original payment
      const { data: originalPayment, error: fetchError } = await paymentService.getById(paymentId);
      if (fetchError) throw fetchError;

      // Create refund record
      const { data: refund, error: refundError } = await paymentService.processPayment({
        order_id: originalPayment.order_id,
        amount: -Math.abs(amount), // Negative amount for refund
        method: originalPayment.method,
        reference_number: `refund_${originalPayment.reference_number}`,
        status: 'pending',
        branch_id: user?.branch_id,
        staff_id: user?.id,
        created_at: new Date().toISOString(),
      });

      if (refundError) throw refundError;

      // Process refund with payment gateway
      try {
        // Simulate refund processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update refund status to completed
        const { data: updatedRefund, error: updateError } = await paymentService.updateStatus(
          refund.id,
          'completed',
          `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        );

        if (updateError) throw updateError;

        // Log refund activity
        await activityLogService.logActivity({
          user_id: user?.id,
          branch_id: user?.branch_id,
          action: 'payment_refunded',
          resource_type: 'payment',
          resource_id: updatedRefund.id,
          details: `Refund processed: ${formatCurrency(amount)} - ${reason}`,
        });

        return updatedRefund;

      } catch (processingError) {
        // Update refund status to failed
        await paymentService.updateStatus(refund.id, 'failed');

        throw processingError;
      }
    },
    onSuccess: (refund) => {
      toast.success(`Refund of ${formatCurrency(Math.abs(refund.amount))} processed successfully`);
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (error) => {
      toast.error('Refund processing failed. Please try again.');
      console.error('Refund processing error:', error);
    },
  });

  // Get payments for order
  const getOrderPayments = useCallback(async (orderId: string) => {
    const { data, error } = await paymentService.getByOrder(orderId);
    if (error) {
      toast.error('Failed to load order payments');
      return [];
    }
    return data || [];
  }, []);

  // Calculate payment breakdown
  const calculatePaymentBreakdown = useCallback((payments: Payment[]) => {
    const successful = payments.filter(p => p.status === 'completed');
    const pending = payments.filter(p => p.status === 'pending');
    const failed = payments.filter(p => p.status === 'failed');

    const totalPaid = successful.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = pending.reduce((sum, p) => sum + p.amount, 0);

    return {
      successful: successful.length,
      pending: pending.length,
      failed: failed.length,
      totalPaid,
      totalPending,
      paymentMethods: successful.reduce((acc, payment) => {
        acc[payment.method] = (acc[payment.method] || 0) + payment.amount;
        return acc;
      }, {} as Record<PaymentMethod, number>),
    };
  }, []);

  // Validate payment data
  const validatePaymentData = useCallback((paymentData: ProcessPaymentData) => {
    const errors: string[] = [];

    if (!paymentData.order_id) {
      errors.push('Order ID is required');
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Payment amount must be greater than 0');
    }

    if (!paymentData.method) {
      errors.push('Payment method is required');
    }

    if (paymentData.method === 'card' && !paymentData.customer_payment_method_id) {
      errors.push('Card payment requires customer payment method');
    }

    if (paymentData.tips && paymentData.tips < 0) {
      errors.push('Tips cannot be negative');
    }

    return errors;
  }, []);

  // Get payment method validation rules
  const getPaymentMethodRules = useCallback((method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return {
          requiresReference: false,
          maxAmount: 10000, // $10,000 max cash payment
          allowsTips: true,
        };
      case 'card':
        return {
          requiresReference: true,
          maxAmount: 50000, // $50,000 max card payment
          allowsTips: true,
        };
      case 'mobile':
        return {
          requiresReference: true,
          maxAmount: 25000, // $25,000 max mobile payment
          allowsTips: true,
        };
      case 'credit':
        return {
          requiresReference: true,
          maxAmount: 100000, // $100,000 max credit payment
          allowsTips: false,
        };
      case 'voucher':
        return {
          requiresReference: true,
          maxAmount: 1000, // $1,000 max voucher payment
          allowsTips: false,
        };
      default:
        return {
          requiresReference: false,
          maxAmount: 10000,
          allowsTips: true,
        };
    }
  }, []);

  // Calculate change for cash payments
  const calculateChange = useCallback((amountPaid: number, amountDue: number) => {
    return Math.max(0, amountPaid - amountDue);
  }, []);

  // Get today's payments
  const getTodayPayments = useCallback((payments: Payment[]) => {
    const today = new Date().toDateString();
    return payments.filter(payment =>
      new Date(payment.created_at).toDateString() === today &&
      payment.status === 'completed'
    );
  }, []);

  return {
    // Actions
    processPayment: processPaymentMutation.mutate,
    refundPayment: refundPaymentMutation.mutate,
    getOrderPayments,

    // Helpers
    calculatePaymentBreakdown,
    validatePaymentData,
    getPaymentMethodRules,
    calculateChange,
    getTodayPayments,

    // Loading states
    isProcessing: processPaymentMutation.isLoading,
    isRefunding: refundPaymentMutation.isLoading,
  };
};