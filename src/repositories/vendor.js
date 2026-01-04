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
}

