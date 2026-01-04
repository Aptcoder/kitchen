export default class CustomerRepository {
  constructor({ db }) {
    this.db = db;
  }

  async createCustomer(customer) {
    const [newCustomer] = await this.db('customers').insert(customer).returning('*');
    return newCustomer;
  }

  async findCustomerByEmail(email) {
    const customer = await this.db('customers').where('email', email).first();
    return customer;
  }

  async findCustomerById(id) {
    const customer = await this.db('customers').where('id', id).first();
    return customer;
  }

  async updateCustomer(customerId, customer) {
    const [updatedCustomer] = await this.db('customers').where('id', customerId).update(customer).returning('*');
    return updatedCustomer;
  }
}