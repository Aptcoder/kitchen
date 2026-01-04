class CustomerController {
  constructor({ customerService }) {
    this.customerService = customerService;
  }

  async createCustomer(req, res) {
    const customer = await this.customerService.createCustomer(req.body);
    return res.status(201).json({
      status: true,
      message: 'Customer created successfully',
      data: customer,
    });
  }

  async updateCustomer(req, res) {
    const customer = await this.customerService.updateCustomer(req.params.id, req.body);
    return res.json({
      status: true,
      data: customer,
      message: 'Customer updated successfully',
    });
  }

  async authenticateCustomer(req, res) {
    const { customer, token } = await this.customerService.authenticateCustomer(req.body);
    return res.json({
      status: true,
      message: 'Customer authenticated successfully',
      data: {
        customer,
        token,
      },
    });
  }

  async getCustomers(req, res) {
    const customers = await this.customerService.getCustomers();
    return res.json({
        status: true,
        data: customers,
        message: 'Customers fetched successfully',
    });
  }

  async getCustomer(req, res) {
    const customer = await this.customerService.getCustomer(req.params.id);
    return res.json({
      status: true,
      data: customer,
      message: 'Customer fetched successfully',
    });
  }
}

export default CustomerController;