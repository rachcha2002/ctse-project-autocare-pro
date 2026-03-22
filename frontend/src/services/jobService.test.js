import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as jobService from './jobService';
import api from './api';

// Mock the api module
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('jobService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getJob', () => {
    it('fetches a job by ID', async () => {
      const mockJob = { id: 1, status: 'in_progress', appointmentId: 1 };
      api.get.mockResolvedValue({ data: mockJob });

      const result = await jobService.getJob(1);

      expect(api.get).toHaveBeenCalledWith('/api/jobs/1');
      expect(result).toEqual(mockJob);
    });

    it('throws error when job not found', async () => {
      api.get.mockRejectedValue(new Error('Not found'));

      await expect(jobService.getJob(999)).rejects.toThrow('Not found');
    });
  });

  describe('getJobByAppointment', () => {
    it('fetches job by appointment ID', async () => {
      const mockJob = { id: 1, appointmentId: 5, status: 'pending' };
      api.get.mockResolvedValue({ data: mockJob });

      const result = await jobService.getJobByAppointment(5);

      expect(api.get).toHaveBeenCalledWith('/api/jobs/appointment/5');
      expect(result).toEqual(mockJob);
    });

    it('throws error when appointment has no job', async () => {
      api.get.mockRejectedValue(new Error('Job not found'));

      await expect(jobService.getJobByAppointment(999)).rejects.toThrow('Job not found');
    });
  });

  describe('getVehicleJobs', () => {
    it('fetches jobs for a vehicle', async () => {
      const mockJobs = [
        { id: 1, vehicleId: 1, status: 'completed' },
        { id: 2, vehicleId: 1, status: 'in_progress' },
      ];
      api.get.mockResolvedValue({ data: mockJobs });

      const result = await jobService.getVehicleJobs(1);

      expect(api.get).toHaveBeenCalledWith('/api/jobs/vehicle/1');
      expect(result).toEqual(mockJobs);
    });

    it('throws error when fetch fails', async () => {
      api.get.mockRejectedValue(new Error('Failed to fetch'));

      await expect(jobService.getVehicleJobs(1)).rejects.toThrow('Failed to fetch');
    });
  });

  describe('getMechanics', () => {
    it('fetches list of mechanics', async () => {
      const mockMechanics = [
        { id: 1, fullName: 'John Mechanic', role: 'mechanic' },
        { id: 2, fullName: 'Jane Mechanic', role: 'mechanic' },
      ];
      api.get.mockResolvedValue({ data: mockMechanics });

      const result = await jobService.getMechanics();

      expect(api.get).toHaveBeenCalledWith('/api/jobs/mechanics/list');
      expect(result).toEqual(mockMechanics);
    });

    it('throws error when fetch fails', async () => {
      api.get.mockRejectedValue(new Error('Failed to fetch mechanics'));

      await expect(jobService.getMechanics()).rejects.toThrow('Failed to fetch mechanics');
    });
  });

  describe('assignJob', () => {
    it('assigns a mechanic to a job', async () => {
      const mockResponse = { id: 1, mechanicId: 5, status: 'assigned' };
      api.patch.mockResolvedValue({ data: mockResponse });

      const result = await jobService.assignJob(1, 5);

      expect(api.patch).toHaveBeenCalledWith('/api/jobs/1/assign', { mechanicId: 5 });
      expect(result).toEqual(mockResponse);
    });

    it('throws error when assignment fails', async () => {
      api.patch.mockRejectedValue(new Error('Assignment failed'));

      await expect(jobService.assignJob(1, 5)).rejects.toThrow('Assignment failed');
    });
  });

  describe('startJob', () => {
    it('starts a job by ID', async () => {
      const mockResponse = { id: 1, status: 'in_progress', startedAt: '2024-01-15T10:00:00Z' };
      api.patch.mockResolvedValue({ data: mockResponse });

      const result = await jobService.startJob(1);

      expect(api.patch).toHaveBeenCalledWith('/api/jobs/1/start');
      expect(result).toEqual(mockResponse);
    });

    it('throws error when start fails', async () => {
      api.patch.mockRejectedValue(new Error('Cannot start job'));

      await expect(jobService.startJob(1)).rejects.toThrow('Cannot start job');
    });
  });

  describe('updateJobProgress', () => {
    it('updates job progress', async () => {
      const progressData = { notes: 'Halfway done', progressPercent: 50 };
      const mockResponse = { id: 1, ...progressData };
      api.put.mockResolvedValue({ data: mockResponse });

      const result = await jobService.updateJobProgress(1, progressData);

      expect(api.put).toHaveBeenCalledWith('/api/jobs/1/progress', progressData);
      expect(result).toEqual(mockResponse);
    });

    it('throws error when update fails', async () => {
      api.put.mockRejectedValue(new Error('Update failed'));

      await expect(jobService.updateJobProgress(1, {})).rejects.toThrow('Update failed');
    });
  });

  describe('completeJob', () => {
    it('completes a job with completion data', async () => {
      const completionData = { summary: 'Oil changed successfully', finalCost: 5000 };
      const mockResponse = { id: 1, status: 'completed', ...completionData };
      api.patch.mockResolvedValue({ data: mockResponse });

      const result = await jobService.completeJob(1, completionData);

      expect(api.patch).toHaveBeenCalledWith('/api/jobs/1/complete', completionData);
      expect(result).toEqual(mockResponse);
    });

    it('throws error when completion fails', async () => {
      api.patch.mockRejectedValue(new Error('Completion failed'));

      await expect(jobService.completeJob(1, {})).rejects.toThrow('Completion failed');
    });
  });

  describe('getAllJobs', () => {
    it('returns empty array placeholder', async () => {
      const result = await jobService.getAllJobs();

      expect(result).toEqual([]);
    });
  });
});
