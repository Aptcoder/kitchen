import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { createContainer, InjectionMode, asClass, asValue } from 'awilix';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../../src/utils/errors.js';

const mockBcryptHash = jest.fn();
const mockBcryptCompare = jest.fn();
const mockGenerateToken = jest.fn();

jest.unstable_mockModule('bcrypt', () => ({
  default: {
    hash: mockBcryptHash,
    compare: mockBcryptCompare,
  },
}));

jest.unstable_mockModule('../../../src/utils/jwt.js', () => ({
  generateToken: mockGenerateToken,
}));

const { default: VendorService } = await import('../../../src/services/vendor.js');

describe('VendorService', () => {
  let container;
  let mockVendorRepository;
  let vendorService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBcryptHash.mockClear();
    mockBcryptCompare.mockClear();
    mockGenerateToken.mockClear();

    mockVendorRepository = {
      findVendorByEmail: jest.fn(),
      findVendorById: jest.fn(),
      findAllVendors: jest.fn(),
      createVendor: jest.fn(),
      updateVendor: jest.fn(),
    };

    container = createContainer({
      injectionMode: InjectionMode.PROXY,
    });

    container.register({
      vendorRepository: asValue(mockVendorRepository),
      vendorService: asClass(VendorService),
    });

    vendorService = container.resolve('vendorService');
  });

  describe('createVendor', () => {
    it('should create vendor with hashed password', async () => {
      const vendorData = {
        name: 'Test Vendor',
        email: 'vendor@example.com',
        password: 'password123',
        address: '123 Main St',
        phone: '123-456-7890',
      };

      const hashedPassword = 'hashed_password_123';
      const createdVendor = {
        id: 1,
        ...vendorData,
        password: hashedPassword,
      };

      mockVendorRepository.findVendorByEmail.mockResolvedValue(null);
      mockBcryptHash.mockResolvedValue(hashedPassword);
      mockVendorRepository.createVendor.mockResolvedValue(createdVendor);

      const result = await vendorService.createVendor(vendorData);

      expect(mockVendorRepository.findVendorByEmail).toHaveBeenCalledWith(vendorData.email);
      expect(mockBcryptHash).toHaveBeenCalledWith(vendorData.password, 10);
      expect(mockVendorRepository.createVendor).toHaveBeenCalledWith({
        ...vendorData,
        password: hashedPassword,
      });
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual({
        id: 1,
        name: 'Test Vendor',
        email: 'vendor@example.com',
        address: '123 Main St',
        phone: '123-456-7890',
      });
    });

    it('should throw ConflictError if vendor already exists', async () => {
      const vendorData = {
        name: 'Existing Vendor',
        email: 'existing@example.com',
        password: 'password123',
      };

      const existingVendor = {
        id: 1,
        email: 'existing@example.com',
      };

      mockVendorRepository.findVendorByEmail.mockResolvedValue(existingVendor);

      await expect(vendorService.createVendor(vendorData)).rejects.toThrow(ConflictError);
      expect(mockVendorRepository.createVendor).not.toHaveBeenCalled();
    });
  });

  describe('getVendor', () => {
    it('should return vendor without password', async () => {
      const vendorId = 1;
      const vendor = {
        id: 1,
        name: 'Test Vendor',
        email: 'vendor@example.com',
        address: '123 Main St',
        phone: '123-456-7890',
        password: 'hashed_password',
      };

      mockVendorRepository.findVendorById.mockResolvedValue(vendor);

      const result = await vendorService.getVendor(vendorId);

      expect(mockVendorRepository.findVendorById).toHaveBeenCalledWith(vendorId);
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual({
        id: 1,
        name: 'Test Vendor',
        email: 'vendor@example.com',
        address: '123 Main St',
        phone: '123-456-7890',
      });
    });

    it('should throw NotFoundError if vendor does not exist', async () => {
      const vendorId = 999;

      mockVendorRepository.findVendorById.mockResolvedValue(null);

      await expect(vendorService.getVendor(vendorId)).rejects.toThrow(NotFoundError);
      expect(mockVendorRepository.findVendorById).toHaveBeenCalledWith(vendorId);
    });
  });

  describe('getVendors', () => {
    it('should return all vendors without passwords', async () => {
      const vendors = [
        {
          id: 1,
          name: 'Vendor 1',
          email: 'vendor1@example.com',
          password: 'hashed_password_1',
        },
        {
          id: 2,
          name: 'Vendor 2',
          email: 'vendor2@example.com',
          password: 'hashed_password_2',
        },
      ];

      mockVendorRepository.findAllVendors.mockResolvedValue(vendors);

      const result = await vendorService.getVendors();

      expect(mockVendorRepository.findAllVendors).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
      expect(result).toEqual([
        {
          id: 1,
          name: 'Vendor 1',
          email: 'vendor1@example.com',
        },
        {
          id: 2,
          name: 'Vendor 2',
          email: 'vendor2@example.com',
        },
      ]);
    });

    it('should return empty array when no vendors exist', async () => {
      mockVendorRepository.findAllVendors.mockResolvedValue([]);

      const result = await vendorService.getVendors();

      expect(result).toEqual([]);
    });
  });

  describe('updateVendor', () => {
    it('should update vendor successfully and return without password', async () => {
      const vendorId = 1;
      const updateData = {
        name: 'Updated Vendor',
        address: '456 New St',
      };

      const existingVendor = {
        id: 1,
        name: 'Test Vendor',
        email: 'vendor@example.com',
        address: '123 Main St',
        password: 'hashed_password',
      };

      const updatedVendor = {
        ...existingVendor,
        ...updateData,
      };

      mockVendorRepository.findVendorById.mockResolvedValue(existingVendor);
      mockVendorRepository.updateVendor.mockResolvedValue(updatedVendor);

      const result = await vendorService.updateVendor(vendorId, updateData);

      expect(mockVendorRepository.findVendorById).toHaveBeenCalledWith(vendorId);
      expect(mockVendorRepository.updateVendor).toHaveBeenCalledWith(vendorId, updateData);
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual({
        id: 1,
        name: 'Updated Vendor',
        email: 'vendor@example.com',
        address: '456 New St',
      });
    });

    it('should throw NotFoundError if vendor does not exist', async () => {
      const vendorId = 999;
      const updateData = {
        name: 'Updated Vendor',
      };

      mockVendorRepository.findVendorById.mockResolvedValue(null);

      await expect(vendorService.updateVendor(vendorId, updateData)).rejects.toThrow(NotFoundError);
      expect(mockVendorRepository.updateVendor).not.toHaveBeenCalled();
    });
  });

  describe('authenticateVendor', () => {
    it('should return token and vendor data on valid credentials', async () => {
      const credentials = {
        email: 'vendor@example.com',
        password: 'password123',
      };

      const vendor = {
        id: 1,
        name: 'Test Vendor',
        email: 'vendor@example.com',
        address: '123 Main St',
        password: 'hashed_password',
      };

      const token = 'jwt_token_123';

      mockVendorRepository.findVendorByEmail.mockResolvedValue(vendor);
      mockBcryptCompare.mockResolvedValue(true);
      mockGenerateToken.mockReturnValue(token);

      const result = await vendorService.authenticateVendor(credentials);

      expect(mockVendorRepository.findVendorByEmail).toHaveBeenCalledWith(credentials.email);
      expect(mockBcryptCompare).toHaveBeenCalledWith(credentials.password, vendor.password);
      expect(mockGenerateToken).toHaveBeenCalledWith({
        id: vendor.id,
        email: vendor.email,
        type: 'vendor',
      });
      expect(result).toEqual({
        vendor: {
          id: 1,
          name: 'Test Vendor',
          email: 'vendor@example.com',
          address: '123 Main St',
        },
        token,
      });
      expect(result.vendor).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedError on invalid email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockVendorRepository.findVendorByEmail.mockResolvedValue(null);

      await expect(vendorService.authenticateVendor(credentials)).rejects.toThrow(UnauthorizedError);
      expect(mockBcryptCompare).not.toHaveBeenCalled();
      expect(mockGenerateToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError on invalid password', async () => {
      const credentials = {
        email: 'vendor@example.com',
        password: 'wrong_password',
      };

      const vendor = {
        id: 1,
        email: 'vendor@example.com',
        password: 'hashed_password',
      };

      mockVendorRepository.findVendorByEmail.mockResolvedValue(vendor);
      mockBcryptCompare.mockResolvedValue(false);

      await expect(vendorService.authenticateVendor(credentials)).rejects.toThrow(UnauthorizedError);
      expect(mockBcryptCompare).toHaveBeenCalledWith(credentials.password, vendor.password);
      expect(mockGenerateToken).not.toHaveBeenCalled();
    });
  });
});

