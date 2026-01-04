export default class VendorRepository {
  constructor({ db }) {
    this.db = db;
  }

  async createVendor(vendor) {
    const [newVendor] = await this.db('vendors').insert(vendor).returning('*');
    return newVendor;
  }

  async findVendorByEmail(email) {
    const vendor = await this.db('vendors').where('email', email).first();
    return vendor;
  }

  async findVendorById(id) {
    const vendor = await this.db('vendors').where('id', id).first();
    return vendor;
  }

  async findAllVendors() {
    return this.db('vendors');
  }

  async updateVendor(vendorId, vendor) {
    const [updatedVendor] = await this.db('vendors').where('id', vendorId).update(vendor).returning('*');
    return updatedVendor;
  }
}

