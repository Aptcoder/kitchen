import { BadRequestError } from '../utils/errors.js';

class MenuItemController {
  constructor({ menuItemService }) {
    this.menuItemService = menuItemService;
  }

  async createMenuItems(req, res) {
    const vendorId = req.vendor.id;
    const menuItems = await this.menuItemService.createMenuItems(vendorId, req.body);
    return res.status(201).json({
      status: true,
      message: 'MenuItems created successfully',
      data: menuItems,
    });
  }

  async getVendorMenuItems(req, res) {
    const vendorId = req.vendor ? req.vendor.id : req.query.vendor_id;
    if (!vendorId) {
      throw new BadRequestError('Vendor ID is required');
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const pagination = { page, limit, offset };
    const result = await this.menuItemService.getVendorMenuItems(vendorId, pagination);

    return res.status(200).json({
      status: true,
      message: 'Menu items fetched successfully',
      data: result.data,
      meta: result.meta,
    });
  }

  async getMenuItem(req, res) {
    const menuItem = await this.menuItemService.getMenuItem(req.params.id);
    return res.status(200).json({
      status: true,
      message: 'Menu item fetched successfully',
      data: menuItem,
    });
  }

  async updateMenuItem(req, res) {
    const vendorId = req.vendor.id;
    const menuItem = await this.menuItemService.updateMenuItem(vendorId, req.params.id, req.body);
    return res.status(200).json({
      status: true,
      message: 'Menu item updated successfully',
      data: menuItem,
    });
  }

  async deleteMenuItem(req, res) {
    const vendorId = req.vendor.id;
    await this.menuItemService.deleteMenuItem(vendorId, req.params.id);
    return res.status(200).json({
      status: true,
      message: 'Menu item deleted successfully',
    });
  }
}

export default MenuItemController;