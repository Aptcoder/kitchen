class MenuItemController {
  constructor({ menuItemService }) {
    this.menuItemService = menuItemService;
  }

  async createMenuItems(req, res) {
    const menuItems = await this.menuItemService.createMenuItems(req.body);
    return res.status(201).json({
      status: true,
      message: 'MenuItems created successfully',
      data: menuItems,
    });
  }
}

export default MenuItemController;