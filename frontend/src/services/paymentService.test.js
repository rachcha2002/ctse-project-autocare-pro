import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as paymentService from './paymentService';
import api from './api';

// Mock the api module
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMyPayments', () => {
    it('fetches payments for a customer', async () => {
      const mockPayments = [
        { id: 1, amount: 5000, status: 'paid' },
        { id: 2, amount: 7500, status: 'pending' },
      ];
      api.get.mockResolvedValue({ data: mockPayments });

      const result = await paymentService.getMyPayments(1);

      expect(api.get).toHaveBeenCalledWith('/api/payments/customer/1');
      expect(result).toEqual(mockPayments);
    });

    it('throws error when fetch fails', async () => {
      api.get.mockRejectedValue(new Error('Failed to fetch payments'));

      await expect(paymentService.getMyPayments(1)).rejects.toThrow('Failed to fetch payments');
    });
  });

  describe('getPayment', () => {
    it('fetches a payment by ID', async () => {
      const mockPayment = { id: 1, amount: 5000, status: 'pending' };
      api.get.mockResolvedValue({ data: mockPayment });

      const result = await paymentService.getPayment(1);

      expect(api.get).toHaveBeenCalledWith('/api/payments/1');
      expect(result).toEqual(mockPayment);
    });

    it('throws error when payment not found', async () => {
      api.get.mockRejectedValue(new Error('Payment not found'));

      await expect(paymentService.getPayment(999)).rejects.toThrow('Payment not found');
    });
  });

  describe('getPaymentByJob', () => {
    it('fetches payment by job ID', async () => {
      const mockPayment = { id: 1, jobId: 5, amount: 5000, status: 'pending' };
      api.get.mockResolvedValue({ data: mockPayment });

      const result = await paymentService.getPaymentByJob(5);

      expect(api.get).toHaveBeenCalledWith('/api/payments/job/5');
      expect(result).toEqual(mockPayment);
    });

    it('throws error when job has no payment', async () => {
      api.get.mockRejectedValue(new Error('No payment found'));

      await expect(paymentService.getPaymentByJob(999)).rejects.toThrow('No payment found');
    });
  });

  describe('processPayment', () => {
    it('processes a payment with payment method', async () => {
      const mockResponse = { id: 1, status: 'paid', paymentMethod: 'card' };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await paymentService.processPayment(1, 'card');

      expect(api.post).toHaveBeenCalledWith('/api/payments/1/pay', { paymentMethod: 'card' });
      expect(result).toEqual(mockResponse);
    });

    it('processes payment with cash method', async () => {
      const mockResponse = { id: 1, status: 'paid', paymentMethod: 'cash' };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await paymentService.processPayment(1, 'cash');

      expect(api.post).toHaveBeenCalledWith('/api/payments/1/pay', { paymentMethod: 'cash' });
      expect(result).toEqual(mockResponse);
    });

    it('throws error when payment processing fails', async () => {
      api.post.mockRejectedValue(new Error('Payment failed'));

      await expect(paymentService.processPayment(1, 'card')).rejects.toThrow('Payment failed');
    });
  });

  describe('getReceipt', () => {
    it('fetches receipt for a payment', async () => {
      const mockReceipt = {
        id: 1,
        invoiceNumber: 'INV-001',
        amount: 5000,
        paidAt: '2024-01-15T10:00:00Z',
      };
      api.get.mockResolvedValue({ data: mockReceipt });

      const result = await paymentService.getReceipt(1);

      expect(api.get).toHaveBeenCalledWith('/api/payments/1/receipt');
      expect(result).toEqual(mockReceipt);
    });

    it('throws error when receipt not available', async () => {
      api.get.mockRejectedValue(new Error('Receipt not available'));

      await expect(paymentService.getReceipt(1)).rejects.toThrow('Receipt not available');
    });
  });

  describe('cancelInvoice', () => {
    it('cancels an invoice by ID', async () => {
      const mockResponse = { id: 1, status: 'cancelled' };
      api.patch.mockResolvedValue({ data: mockResponse });

      const result = await paymentService.cancelInvoice(1);

      expect(api.patch).toHaveBeenCalledWith('/api/payments/1/cancel');
      expect(result).toEqual(mockResponse);
    });

    it('throws error when cancellation fails', async () => {
      api.patch.mockRejectedValue(new Error('Cannot cancel invoice'));

      await expect(paymentService.cancelInvoice(1)).rejects.toThrow('Cannot cancel invoice');
    });
  });
});
