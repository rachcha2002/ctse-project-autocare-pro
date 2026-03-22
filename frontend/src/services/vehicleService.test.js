import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as vehicleService from './vehicleService';
import api from './api';

// Mock the api module
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('vehicleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMyVehicles', () => {
    it('fetches vehicles for a customer', async () => {
      const mockVehicles = [
        { id: 1, registrationNumber: 'ABC-1234', brand: 'Toyota' },
        { id: 2, registrationNumber: 'XYZ-5678', brand: 'Honda' },
      ];
      api.get.mockResolvedValue({ data: mockVehicles });

      const result = await vehicleService.getMyVehicles(1);

      expect(api.get).toHaveBeenCalledWith('/api/vehicles/customer/1');
      expect(result).toEqual(mockVehicles);
    });

    it('throws error when API fails', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      await expect(vehicleService.getMyVehicles(1)).rejects.toThrow('Network error');
    });
  });

  describe('getVehicle', () => {
    it('fetches a single vehicle by ID', async () => {
      const mockVehicle = { id: 1, registrationNumber: 'ABC-1234', brand: 'Toyota' };
      api.get.mockResolvedValue({ data: mockVehicle });

      const result = await vehicleService.getVehicle(1);

      expect(api.get).toHaveBeenCalledWith('/api/vehicles/1');
      expect(result).toEqual(mockVehicle);
    });

    it('throws error when vehicle not found', async () => {
      api.get.mockRejectedValue(new Error('Not found'));

      await expect(vehicleService.getVehicle(999)).rejects.toThrow('Not found');
    });
  });

  describe('registerVehicle', () => {
    it('registers a new vehicle', async () => {
      const vehicleData = {
        customerId: 1,
        registrationNumber: 'NEW-1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2022,
      };
      const mockResponse = { id: 1, ...vehicleData };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await vehicleService.registerVehicle(vehicleData);

      expect(api.post).toHaveBeenCalledWith('/api/vehicles', vehicleData);
      expect(result).toEqual(mockResponse);
    });

    it('throws error when registration fails', async () => {
      api.post.mockRejectedValue(new Error('Registration failed'));

      await expect(vehicleService.registerVehicle({})).rejects.toThrow('Registration failed');
    });
  });

  describe('updateVehicle', () => {
    it('updates a vehicle by ID', async () => {
      const vehicleData = { brand: 'Honda' };
      const mockResponse = { id: 1, registrationNumber: 'ABC-1234', brand: 'Honda' };
      api.put.mockResolvedValue({ data: mockResponse });

      const result = await vehicleService.updateVehicle(1, vehicleData);

      expect(api.put).toHaveBeenCalledWith('/api/vehicles/1', vehicleData);
      expect(result).toEqual(mockResponse);
    });

    it('throws error when update fails', async () => {
      api.put.mockRejectedValue(new Error('Update failed'));

      await expect(vehicleService.updateVehicle(1, {})).rejects.toThrow('Update failed');
    });
  });

  describe('getVehicleHistory', () => {
    it('fetches vehicle service history', async () => {
      const mockHistory = [
        { id: 1, serviceType: 'Oil Change', date: '2024-01-15' },
        { id: 2, serviceType: 'Brake Service', date: '2024-02-20' },
      ];
      api.get.mockResolvedValue({ data: mockHistory });

      const result = await vehicleService.getVehicleHistory(1);

      expect(api.get).toHaveBeenCalledWith('/api/vehicles/1/history');
      expect(result).toEqual(mockHistory);
    });

    it('throws error when fetching history fails', async () => {
      api.get.mockRejectedValue(new Error('Failed to fetch history'));

      await expect(vehicleService.getVehicleHistory(1)).rejects.toThrow('Failed to fetch history');
    });
  });
});
