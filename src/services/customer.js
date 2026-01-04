import bcrypt from 'bcrypt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { generateToken } from '../utils/jwt.js';

class CustomerService {
  constructor({ customerRepository }) {
    this.customerRepository = customerRepository;
  }

  async createCustomer(customer) {
    const existingCustomer = await this.customerRepository.findCustomerByEmail(customer.email);
    if (existingCustomer) {
      throw new ConflictError('Customer already exists');
    }
    const hashedPassword = await bcrypt.hash(customer.password, 10);
    const newCustomer = await this.customerRepository.createCustomer({ ...customer, password: hashedPassword });
    return newCustomer;
  }

  async getCustomer(customerId) {
    const customer = await this.customerRepository.findCustomerById(customerId);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }
    const { password, ...customerData } = customer;
    return customerData;
  }

  async updateCustomer(customerId, customer) {
    const existingCustomer = await this.customerRepository.findCustomerById(customerId);
    if (!existingCustomer) {
      throw new NotFoundError('Customer not found');
    }
    const updatedCustomer = await this.customerRepository.updateCustomer(customerId, customer);
    const { password, ...customerData } = updatedCustomer;
    return customerData;
  }

  async authenticateCustomer(credentials) {
    const customer = await this.customerRepository.findCustomerByEmail(credentials.email);
    
    if (!customer) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, customer.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken({
      id: customer.id,
      email: customer.email,
      type: 'customer',
    });

    const { password, ...customerData } = customer;

    return {
      customer: customerData,
      token,
    };
  }
}

export default CustomerService;