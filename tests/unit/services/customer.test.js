import { describe, it, expect, jest, beforeEach, beforeAll } from '@jest/globals';
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

const { default: CustomerService } = await import('../../../src/services/customer.js');

describe('CustomerService', () => {
  let container;
  let mockCustomerRepository;
  let customerService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBcryptHash.mockClear();
    mockBcryptCompare.mockClear();
    mockGenerateToken.mockClear();

    mockCustomerRepository = {
      findCustomerByEmail: jest.fn(),
      findCustomerById: jest.fn(),
      createCustomer: jest.fn(),
      updateCustomer: jest.fn(),
    };

    container = createContainer({
      injectionMode: InjectionMode.PROXY,
    });

    container.register({
      customerRepository: asValue(mockCustomerRepository),
      customerService: asClass(CustomerService),
    });

    customerService = container.resolve('customerService');
  });

  describe('createCustomer', () => {
    it('should create customer with hashed password', async () => {
      const customerData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      };

      const hashedPassword = 'hashed_password_123';
      const createdCustomer = {
        id: 1,
        ...customerData,
        password: hashedPassword,
      };

      mockCustomerRepository.findCustomerByEmail.mockResolvedValue(null);
      mockBcryptHash.mockResolvedValue(hashedPassword);
      mockCustomerRepository.createCustomer.mockResolvedValue(createdCustomer);

      const result = await customerService.createCustomer(customerData);

      expect(mockCustomerRepository.findCustomerByEmail).toHaveBeenCalledWith(customerData.email);
      expect(mockBcryptHash).toHaveBeenCalledWith(customerData.password, 10);
      expect(mockCustomerRepository.createCustomer).toHaveBeenCalledWith({
        ...customerData,
        password: hashedPassword,
      });
      expect(result).toEqual(createdCustomer);
    });

    it('should throw ConflictError if customer already exists', async () => {
      const customerData = {
        email: 'existing@example.com',
        password: 'password123',
      };

      const existingCustomer = {
        id: 1,
        email: 'existing@example.com',
      };

      mockCustomerRepository.findCustomerByEmail.mockResolvedValue(existingCustomer);

      await expect(customerService.createCustomer(customerData)).rejects.toThrow(ConflictError);
      expect(mockCustomerRepository.createCustomer).not.toHaveBeenCalled();
    });
  });

  describe('getCustomer', () => {
    it('should return customer without password', async () => {
      const customerId = 1;
      const customer = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password: 'hashed_password',
      };

      mockCustomerRepository.findCustomerById.mockResolvedValue(customer);

      const result = await customerService.getCustomer(customerId);

      expect(mockCustomerRepository.findCustomerById).toHaveBeenCalledWith(customerId);
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
      });
    });

    it('should throw NotFoundError if customer does not exist', async () => {
      const customerId = 999;

      mockCustomerRepository.findCustomerById.mockResolvedValue(null);

      await expect(customerService.getCustomer(customerId)).rejects.toThrow(NotFoundError);
      expect(mockCustomerRepository.findCustomerById).toHaveBeenCalledWith(customerId);
    });
  });

  describe('updateCustomer', () => {
    it('should update customer successfully and return without password', async () => {
      const customerId = 1;
      const updateData = {
        first_name: 'Jane',
        last_name: 'Smith',
      };

      const existingCustomer = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password: 'hashed_password',
      };

      const updatedCustomer = {
        ...existingCustomer,
        ...updateData,
      };

      mockCustomerRepository.findCustomerById.mockResolvedValue(existingCustomer);
      mockCustomerRepository.updateCustomer.mockResolvedValue(updatedCustomer);

      const result = await customerService.updateCustomer(customerId, updateData);

      expect(mockCustomerRepository.findCustomerById).toHaveBeenCalledWith(customerId);
      expect(mockCustomerRepository.updateCustomer).toHaveBeenCalledWith(customerId, updateData);
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
      });
    });

    it('should throw NotFoundError if customer does not exist', async () => {
      const customerId = 999;
      const updateData = {
        first_name: 'Jane',
      };

      mockCustomerRepository.findCustomerById.mockResolvedValue(null);

      await expect(customerService.updateCustomer(customerId, updateData)).rejects.toThrow(NotFoundError);
      expect(mockCustomerRepository.updateCustomer).not.toHaveBeenCalled();
    });
  });

  describe('authenticateCustomer', () => {
    it('should return token and customer data on valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const customer = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password: 'hashed_password',
      };

      const token = 'jwt_token_123';

      mockCustomerRepository.findCustomerByEmail.mockResolvedValue(customer);
      mockBcryptCompare.mockResolvedValue(true);
      mockGenerateToken.mockReturnValue(token);

      const result = await customerService.authenticateCustomer(credentials);

      expect(mockCustomerRepository.findCustomerByEmail).toHaveBeenCalledWith(credentials.email);
      expect(mockBcryptCompare).toHaveBeenCalledWith(credentials.password, customer.password);
      expect(mockGenerateToken).toHaveBeenCalledWith({
        id: customer.id,
        email: customer.email,
        type: 'customer',
      });
      expect(result).toEqual({
        customer: {
          id: 1,
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
        },
        token,
      });
      expect(result.customer).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedError on invalid email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockCustomerRepository.findCustomerByEmail.mockResolvedValue(null);

      await expect(customerService.authenticateCustomer(credentials)).rejects.toThrow(UnauthorizedError);
      expect(mockBcryptCompare).not.toHaveBeenCalled();
      expect(mockGenerateToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError on invalid password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrong_password',
      };

      const customer = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
      };

      mockCustomerRepository.findCustomerByEmail.mockResolvedValue(customer);
      mockBcryptCompare.mockResolvedValue(false);

      await expect(customerService.authenticateCustomer(credentials)).rejects.toThrow(UnauthorizedError);
      expect(mockBcryptCompare).toHaveBeenCalledWith(credentials.password, customer.password);
      expect(mockGenerateToken).not.toHaveBeenCalled();
    });
  });
});
