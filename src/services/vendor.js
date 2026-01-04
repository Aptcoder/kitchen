import bcrypt from 'bcrypt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { generateToken } from '../utils/jwt.js';

class VendorService {
  constructor({ vendorRepository }) {
    this.vendorRepository = vendorRepository;
  }

  async createVendor(vendor) {
    const existingVendor = await this.vendorRepository.findVendorByEmail(vendor.email);
    if (existingVendor) {
      throw new ConflictError('Vendor already exists');
    }
    const hashedPassword = await bcrypt.hash(vendor.password, 10);
    const newVendor = await this.vendorRepository.createVendor({ ...vendor, password: hashedPassword });
    const { password, ...vendorData } = newVendor;
    return vendorData;
  }

  async getVendor(vendorId) {
    const vendor = await this.vendorRepository.findVendorById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }
    const { password, ...vendorData } = vendor;
    return vendorData;
  }

  async getVendors() {
    const vendors = await this.vendorRepository.findAllVendors();
    return vendors.map(vendor => {
      const { password, ...vendorData } = vendor;
      return vendorData;
    });
  }

  async updateVendor(vendorId, vendor) {
    const existingVendor = await this.vendorRepository.findVendorById(vendorId);
    if (!existingVendor) {
      throw new NotFoundError('Vendor not found');
    }
    const updatedVendor = await this.vendorRepository.updateVendor(vendorId, vendor);
    const { password, ...vendorData } = updatedVendor;
    return vendorData;
  }

  async authenticateVendor(credentials) {
    const vendor = await this.vendorRepository.findVendorByEmail(credentials.email);
    
    if (!vendor) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, vendor.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken({
      id: vendor.id,
      email: vendor.email,
      type: 'vendor',
    });

    const { password, ...vendorData } = vendor;

    return {
      vendor: vendorData,
      token,
    };
  }
}

export default VendorService;

