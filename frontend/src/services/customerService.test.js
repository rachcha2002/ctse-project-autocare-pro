import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as customerService from './customerService';
import api from './api';

// Mock the api module
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('customerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCustomerProfile', () => {
    it('fetches customer profile by ID', async () => {
      const mockCustomer = {
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '0771234567',
      };
      api.get.mockResolvedValue({ data: mockCustomer });

      const result = await customerService.getCustomerProfile(1);

      expect(api.get).toHaveBeenCalledWith('/api/customers/1');
      expect(result).toEqual(mockCustomer);
    });

    it('throws error when customer not found', async () => {
      api.get.mockRejectedValue(new Error('Customer not found'));

      await expect(customerService.getCustomerProfile(999)).rejects.toThrow('Customer not found');
    });

    it('throws error when API fails', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      await expect(customerService.getCustomerProfile(1)).rejects.toThrow('Network error');
    });
  });

  describe('updateCustomerProfile', () => {
    it('updates customer profile with provided data', async () => {
      const profileData = { fullName: 'Jane Doe', phone: '0779876543' };
      const mockResponse = {
        id: 1,
        fullName: 'Jane Doe',
        email: 'john@example.com',
        phone: '0779876543',
      };
      api.put.mockResolvedValue({ data: mockResponse });

      const result = await customerService.updateCustomerProfile(1, profileData);

      expect(api.put).toHaveBeenCalledWith('/api/customers/1', profileData);
      expect(result).toEqual(mockResponse);
    });

    it('throws error when update fails', async () => {
      api.put.mockRejectedValue(new Error('Update failed'));

      await expect(customerService.updateCustomerProfile(1, {})).rejects.toThrow('Update failed');
    });

    it('throws error when unauthorized', async () => {
      api.put.mockRejectedValue(new Error('Unauthorized'));

      await expect(customerService.updateCustomerProfile(1, { fullName: 'Test' })).rejects.toThrow('Unauthorized');
    });
  });
});
