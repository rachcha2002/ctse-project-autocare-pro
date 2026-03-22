import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as appointmentService from './appointmentService';
import api from './api';

// Mock the api module
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('appointmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAvailableSlots', () => {
    it('fetches available slots for a given date', async () => {
      const mockSlots = [
        { time: '09:00', available: true },
        { time: '10:00', available: true },
      ];
      api.get.mockResolvedValue({ data: mockSlots });

      const result = await appointmentService.getAvailableSlots('2024-01-15');

      expect(api.get).toHaveBeenCalledWith('/api/appointments/available?date=2024-01-15');
      expect(result).toEqual(mockSlots);
    });

    it('throws error when API fails', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      await expect(appointmentService.getAvailableSlots('2024-01-15')).rejects.toThrow('Network error');
    });
  });

  describe('bookAppointment', () => {
    it('books an appointment with provided data', async () => {
      const appointmentData = {
        customerId: 1,
        vehicleId: 1,
        date: '2024-01-15',
        time: '09:00',
        serviceType: 'Oil Change',
      };
      const mockResponse = { id: 1, ...appointmentData, status: 'pending' };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await appointmentService.bookAppointment(appointmentData);

      expect(api.post).toHaveBeenCalledWith('/api/appointments', appointmentData);
      expect(result).toEqual(mockResponse);
    });

    it('throws error when booking fails', async () => {
      api.post.mockRejectedValue(new Error('Booking failed'));

      await expect(appointmentService.bookAppointment({})).rejects.toThrow('Booking failed');
    });
  });

  describe('getMyAppointments', () => {
    it('fetches appointments for a customer', async () => {
      const mockAppointments = [
        { id: 1, date: '2024-01-15', status: 'confirmed' },
        { id: 2, date: '2024-01-20', status: 'pending' },
      ];
      api.get.mockResolvedValue({ data: mockAppointments });

      const result = await appointmentService.getMyAppointments(1);

      expect(api.get).toHaveBeenCalledWith('/api/appointments/customer/1');
      expect(result).toEqual(mockAppointments);
    });

    it('throws error when fetching fails', async () => {
      api.get.mockRejectedValue(new Error('Failed to fetch'));

      await expect(appointmentService.getMyAppointments(1)).rejects.toThrow('Failed to fetch');
    });
  });

  describe('getAppointment', () => {
    it('fetches a single appointment by ID', async () => {
      const mockAppointment = { id: 1, date: '2024-01-15', status: 'confirmed' };
      api.get.mockResolvedValue({ data: mockAppointment });

      const result = await appointmentService.getAppointment(1);

      expect(api.get).toHaveBeenCalledWith('/api/appointments/1');
      expect(result).toEqual(mockAppointment);
    });

    it('throws error when appointment not found', async () => {
      api.get.mockRejectedValue(new Error('Not found'));

      await expect(appointmentService.getAppointment(999)).rejects.toThrow('Not found');
    });
  });

  describe('cancelAppointment', () => {
    it('cancels an appointment by ID', async () => {
      const mockResponse = { message: 'Appointment cancelled' };
      api.delete.mockResolvedValue({ data: mockResponse });

      const result = await appointmentService.cancelAppointment(1);

      expect(api.delete).toHaveBeenCalledWith('/api/appointments/1');
      expect(result).toEqual(mockResponse);
    });

    it('throws error when cancellation fails', async () => {
      api.delete.mockRejectedValue(new Error('Cannot cancel'));

      await expect(appointmentService.cancelAppointment(1)).rejects.toThrow('Cannot cancel');
    });
  });

  describe('getAllAppointments', () => {
    it('fetches all appointments (admin)', async () => {
      const mockAppointments = [
        { id: 1, customerId: 1, date: '2024-01-15' },
        { id: 2, customerId: 2, date: '2024-01-16' },
      ];
      api.get.mockResolvedValue({ data: mockAppointments });

      const result = await appointmentService.getAllAppointments();

      expect(api.get).toHaveBeenCalledWith('/api/appointments');
      expect(result).toEqual(mockAppointments);
    });

    it('throws error when admin fetch fails', async () => {
      api.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(appointmentService.getAllAppointments()).rejects.toThrow('Unauthorized');
    });
  });

  describe('confirmAppointment', () => {
    it('confirms an appointment by ID', async () => {
      const mockResponse = { id: 1, status: 'confirmed' };
      api.patch.mockResolvedValue({ data: mockResponse });

      const result = await appointmentService.confirmAppointment(1);

      expect(api.patch).toHaveBeenCalledWith('/api/appointments/1/confirm');
      expect(result).toEqual(mockResponse);
    });

    it('throws error when confirmation fails', async () => {
      api.patch.mockRejectedValue(new Error('Already confirmed'));

      await expect(appointmentService.confirmAppointment(1)).rejects.toThrow('Already confirmed');
    });
  });
});
