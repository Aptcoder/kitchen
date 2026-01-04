import { NotFoundError, ForbiddenError } from '../utils/errors.js';

class MenuItemService {
  constructor({ menuItemRepository, vendorRepository }) {
    this.menuItemRepository = menuItemRepository;
    this.vendorRepository = vendorRepository;
  }

  async validateVendor(vendorId) {
    const vendor = await this.vendorRepository.findVendorById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }
    return vendor;
  } 

  async createMenuItems(vendorId, menuItems) {
    const vendor = await this.validateVendor(vendorId);
    const menuItemsWithVendor = menuItems.map(item => ({
      ...item,
      vendor_id: vendorId,
    }));
    return this.menuItemRepository.createMenuItems(menuItemsWithVendor);
  }

  async getVendorMenuItems(vendorId, pagination = {}) {
    const vendor = await this.validateVendor(vendorId);
    
    const total = await this.menuItemRepository.countVendorMenuItems(vendorId);
    const vendorMenuItems = await this.menuItemRepository.getVendorMenuItems(vendorId, pagination);
    
    const { page = 1, limit = 10 } = pagination;
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: vendorMenuItems,
      meta: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getMenuItem(menuItemId) {
    const menuItem = await this.menuItemRepository.getMenuItem(menuItemId);
    if (!menuItem) {
      throw new NotFoundError('Menu item not found');
    }
    return menuItem;
  }

  async updateMenuItem(vendorId, menuItemId, menuItem) {
    const existingItem = await this.menuItemRepository.getMenuItem(menuItemId);
    if (!existingItem) {
      throw new NotFoundError('Menu item not found');
    }
    if (existingItem.vendor_id !== vendorId) {
      throw new ForbiddenError('You do not have permission to update this menu item');
    }
    return this.menuItemRepository.updateMenuItem(menuItemId, menuItem);
  }

  async deleteMenuItem(vendorId, menuItemId) {
    const existingItem = await this.menuItemRepository.getMenuItem(menuItemId);
    if (!existingItem) {
      throw new NotFoundError('Menu item not found');
    }
    if (existingItem.vendor_id !== vendorId) {
      throw new ForbiddenError('You do not have permission to delete this menu item');
    }
    return this.menuItemRepository.deleteMenuItem(menuItemId);
  }
}

export default MenuItemService;