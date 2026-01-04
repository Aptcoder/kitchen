class MenuItemRepository {
  constructor({ db }) {
    this.db = db;
  }

  async createMenuItems(menuItems) {
    return this.db('menu_items').insert(menuItems).returning('*');
  }

  async getVendorMenuItems(vendorId, pagination = {}) {
    const { limit, offset } = pagination;
    let query = this.db('menu_items').where('vendor_id', vendorId);
    
    if (limit !== undefined) {
      query = query.limit(limit);
    }
    if (offset !== undefined) {
      query = query.offset(offset);
    }
    
    return query;
  }

  async countVendorMenuItems(vendorId) {
    const result = await this.db('menu_items')
      .where('vendor_id', vendorId)
      .count('* as total')
      .first();
    return parseInt(result.total, 10);
  }

  async getMenuItem(menuItemId) {
    return this.db('menu_items').where('id', menuItemId).first();
  }

  async updateMenuItem(menuItemId, menuItem) {
    const [updated] = await this.db('menu_items').where('id', menuItemId).update(menuItem).returning('*');
    return updated;
  }

  async deleteMenuItem(menuItemId) {
    return this.db('menu_items').where('id', menuItemId).delete();
  }
}

export default MenuItemRepository;