class VendorController {
  constructor({ vendorService }) {
    this.vendorService = vendorService;
  }

  async createVendor(req, res) {
    const vendor = await this.vendorService.createVendor(req.body);
    return res.status(201).json({
      status: true,
      message: 'Vendor created successfully',
      data: vendor,
    });
  }

  async updateVendor(req, res) {
    const vendor = await this.vendorService.updateVendor(req.params.id, req.body);
    return res.json({
      status: true,
      data: vendor,
      message: 'Vendor updated successfully',
    });
  }

  async authenticateVendor(req, res) {
    const { vendor, token } = await this.vendorService.authenticateVendor(req.body);
    return res.json({
      status: true,
      message: 'Vendor authenticated successfully',
      data: {
        vendor,
        token,
      },
    });
  }

  async getVendors(req, res) {
    const vendors = await this.vendorService.getVendors();
    return res.json({
        status: true,
        data: vendors,
        message: 'Vendors fetched successfully',
    });
  }

  async getVendor(req, res) {
    const vendor = await this.vendorService.getVendor(req.params.id);
    return res.json({
      status: true,
      data: vendor,
      message: 'Vendor fetched successfully',
    });
  }
}

export default VendorController;

