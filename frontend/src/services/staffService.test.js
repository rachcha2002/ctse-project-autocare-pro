import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as staffService from './staffService';
import api from './api';

// Mock the api module
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('staffService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStaffMembers', () => {
    it('fetches all staff members', async () => {
      const mockStaff = [
        { id: 1, fullName: 'Admin User', role: 'admin' },
        { id: 2, fullName: 'John Mechanic', role: 'mechanic' },
      ];
      api.get.mockResolvedValue({ data: mockStaff });

      const result = await staffService.getStaffMembers();

      expect(api.get).toHaveBeenCalledWith('/api/staff');
      expect(result).toEqual(mockStaff);
    });

    it('throws error when fetch fails', async () => {
      api.get.mockRejectedValue(new Error('Failed to fetch staff'));

      await expect(staffService.getStaffMembers()).rejects.toThrow('Failed to fetch staff');
    });

    it('throws error when unauthorized', async () => {
      api.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(staffService.getStaffMembers()).rejects.toThrow('Unauthorized');
    });
  });

  describe('createStaffMember', () => {
    it('creates a new staff member', async () => {
      const staffData = {
        fullName: 'New Mechanic',
        email: 'newmech@autocare.com',
        phone: '0771234567',
        password: 'Password@123',
        role: 'mechanic',
      };
      const mockResponse = { id: 3, ...staffData };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await staffService.createStaffMember(staffData);

      expect(api.post).toHaveBeenCalledWith('/api/staff', staffData);
      expect(result).toEqual(mockResponse);
    });

    it('throws error when email already exists', async () => {
      api.post.mockRejectedValue(new Error('Email already registered'));

      await expect(staffService.createStaffMember({})).rejects.toThrow('Email already registered');
    });

    it('throws error when creation fails', async () => {
      api.post.mockRejectedValue(new Error('Creation failed'));

      await expect(staffService.createStaffMember({})).rejects.toThrow('Creation failed');
    });
  });

  describe('updateStaffMember', () => {
    it('updates a staff member by ID', async () => {
      const staffData = { fullName: 'Updated Name', phone: '0779876543' };
      const mockResponse = { id: 1, fullName: 'Updated Name', phone: '0779876543', role: 'mechanic' };
      api.put.mockResolvedValue({ data: mockResponse });

      const result = await staffService.updateStaffMember(1, staffData);

      expect(api.put).toHaveBeenCalledWith('/api/staff/1', staffData);
      expect(result).toEqual(mockResponse);
    });

    it('throws error when staff not found', async () => {
      api.put.mockRejectedValue(new Error('Staff not found'));

      await expect(staffService.updateStaffMember(999, {})).rejects.toThrow('Staff not found');
    });

    it('throws error when update fails', async () => {
      api.put.mockRejectedValue(new Error('Update failed'));

      await expect(staffService.updateStaffMember(1, {})).rejects.toThrow('Update failed');
    });
  });

  describe('deleteStaffMember', () => {
    it('deletes a staff member by ID', async () => {
      const mockResponse = { message: 'Staff successfully removed' };
      api.delete.mockResolvedValue({ data: mockResponse });

      const result = await staffService.deleteStaffMember(1);

      expect(api.delete).toHaveBeenCalledWith('/api/staff/1');
      expect(result).toEqual(mockResponse);
    });

    it('throws error when staff not found', async () => {
      api.delete.mockRejectedValue(new Error('Staff not found'));

      await expect(staffService.deleteStaffMember(999)).rejects.toThrow('Staff not found');
    });

    it('throws error when deletion fails', async () => {
      api.delete.mockRejectedValue(new Error('Deletion failed'));

      await expect(staffService.deleteStaffMember(1)).rejects.toThrow('Deletion failed');
    });
  });
});
