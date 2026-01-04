import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { createContainer, InjectionMode, asClass, asValue } from 'awilix';
import { NotFoundError, ForbiddenError } from '../../../src/utils/errors.js';

const { default: MenuItemService } = await import('../../../src/services/menu_item.js');

describe('MenuItemService', () => {
  let container;
  let mockMenuItemRepository;
  let mockVendorRepository;
  let menuItemService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMenuItemRepository = {
      createMenuItems: jest.fn(),
      getVendorMenuItems: jest.fn(),
      countVendorMenuItems: jest.fn(),
      getMenuItem: jest.fn(),
      updateMenuItem: jest.fn(),
      deleteMenuItem: jest.fn(),
    };

    mockVendorRepository = {
      findVendorById: jest.fn(),
    };

    container = createContainer({
      injectionMode: InjectionMode.PROXY,
    });

    container.register({
      menuItemRepository: asValue(mockMenuItemRepository),
      vendorRepository: asValue(mockVendorRepository),
      menuItemService: asClass(MenuItemService),
    });

    menuItemService = container.resolve('menuItemService');
  });

  describe('createMenuItems', () => {
    it('should create menu items for a valid vendor', async () => {
      const vendorId = 1;
      const menuItems = [
        {
          name: 'Pizza',
          description: 'Delicious pizza',
          price: 1500,
          image: 'https://example.com/pizza.jpg',
        },
        {
          name: 'Burger',
          description: 'Tasty burger',
          price: 1200,
          image: 'https://example.com/burger.jpg',
        },
      ];

      const vendor = {
        id: 1,
        name: 'Test Vendor',
        email: 'vendor@example.com',
      };

      const createdMenuItems = [
        { id: 1, vendor_id: vendorId, ...menuItems[0] },
        { id: 2, vendor_id: vendorId, ...menuItems[1] },
      ];

      mockVendorRepository.findVendorById.mockResolvedValue(vendor);
      mockMenuItemRepository.createMenuItems.mockResolvedValue(createdMenuItems);

      const result = await menuItemService.createMenuItems(vendorId, menuItems);

      expect(mockVendorRepository.findVendorById).toHaveBeenCalledWith(vendorId);
      expect(mockMenuItemRepository.createMenuItems).toHaveBeenCalledWith([
        { ...menuItems[0], vendor_id: vendorId },
        { ...menuItems[1], vendor_id: vendorId },
      ]);
      expect(result).toEqual(createdMenuItems);
    });

    it('should throw NotFoundError if vendor does not exist', async () => {
      const vendorId = 999;
      const menuItems = [
        {
          name: 'Pizza',
          description: 'Delicious pizza',
          price: 1500,
          image: 'https://example.com/pizza.jpg',
        },
      ];

      mockVendorRepository.findVendorById.mockResolvedValue(null);

      await expect(menuItemService.createMenuItems(vendorId, menuItems)).rejects.toThrow(NotFoundError);
      expect(mockMenuItemRepository.createMenuItems).not.toHaveBeenCalled();
    });
  });

  describe('getVendorMenuItems', () => {
    it('should return paginated menu items with metadata', async () => {
      const vendorId = 1;
      const pagination = { page: 1, limit: 10, offset: 0 };

      const vendor = {
        id: 1,
        name: 'Test Vendor',
        email: 'vendor@example.com',
      };

      const menuItems = [
        { id: 1, vendor_id: vendorId, name: 'Pizza', price: 1500 },
        { id: 2, vendor_id: vendorId, name: 'Burger', price: 1200 },
      ];

      mockVendorRepository.findVendorById.mockResolvedValue(vendor);
      mockMenuItemRepository.countVendorMenuItems.mockResolvedValue(2);
      mockMenuItemRepository.getVendorMenuItems.mockResolvedValue(menuItems);

      const result = await menuItemService.getVendorMenuItems(vendorId, pagination);

      expect(mockVendorRepository.findVendorById).toHaveBeenCalledWith(vendorId);
      expect(mockMenuItemRepository.countVendorMenuItems).toHaveBeenCalledWith(vendorId);
      expect(mockMenuItemRepository.getVendorMenuItems).toHaveBeenCalledWith(vendorId, pagination);
      expect(result).toEqual({
        data: menuItems,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    });

    it('should calculate pagination metadata correctly', async () => {
      const vendorId = 1;
      const pagination = { page: 2, limit: 5, offset: 5 };

      const vendor = {
        id: 1,
        name: 'Test Vendor',
        email: 'vendor@example.com',
      };

      const menuItems = [
        { id: 6, vendor_id: vendorId, name: 'Item 6' },
        { id: 7, vendor_id: vendorId, name: 'Item 7' },
      ];

      mockVendorRepository.findVendorById.mockResolvedValue(vendor);
      mockMenuItemRepository.countVendorMenuItems.mockResolvedValue(12);
      mockMenuItemRepository.getVendorMenuItems.mockResolvedValue(menuItems);

      const result = await menuItemService.getVendorMenuItems(vendorId, pagination);

      expect(result.meta).toEqual({
        page: 2,
        limit: 5,
        total: 12,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should throw NotFoundError if vendor does not exist', async () => {
      const vendorId = 999;
      const pagination = { page: 1, limit: 10, offset: 0 };

      mockVendorRepository.findVendorById.mockResolvedValue(null);

      await expect(menuItemService.getVendorMenuItems(vendorId, pagination)).rejects.toThrow(NotFoundError);
      expect(mockMenuItemRepository.countVendorMenuItems).not.toHaveBeenCalled();
    });
  });

  describe('getMenuItem', () => {
    it('should return menu item by id', async () => {
      const menuItemId = 1;
      const menuItem = {
        id: 1,
        vendor_id: 1,
        name: 'Pizza',
        description: 'Delicious pizza',
        price: 1500,
        image: 'https://example.com/pizza.jpg',
      };

      mockMenuItemRepository.getMenuItem.mockResolvedValue(menuItem);

      const result = await menuItemService.getMenuItem(menuItemId);

      expect(mockMenuItemRepository.getMenuItem).toHaveBeenCalledWith(menuItemId);
      expect(result).toEqual(menuItem);
    });

    it('should throw NotFoundError if menu item does not exist', async () => {
      const menuItemId = 999;

      mockMenuItemRepository.getMenuItem.mockResolvedValue(null);

      await expect(menuItemService.getMenuItem(menuItemId)).rejects.toThrow(NotFoundError);
      expect(mockMenuItemRepository.getMenuItem).toHaveBeenCalledWith(menuItemId);
    });
  });

  describe('updateMenuItem', () => {
    it('should update menu item when vendor owns it', async () => {
      const vendorId = 1;
      const menuItemId = 1;
      const updateData = {
        name: 'Updated Pizza',
        price: 1800,
      };

      const existingItem = {
        id: 1,
        vendor_id: vendorId,
        name: 'Pizza',
        price: 1500,
      };

      const updatedItem = {
        ...existingItem,
        ...updateData,
      };

      mockMenuItemRepository.getMenuItem.mockResolvedValue(existingItem);
      mockMenuItemRepository.updateMenuItem.mockResolvedValue(updatedItem);

      const result = await menuItemService.updateMenuItem(vendorId, menuItemId, updateData);

      expect(mockMenuItemRepository.getMenuItem).toHaveBeenCalledWith(menuItemId);
      expect(mockMenuItemRepository.updateMenuItem).toHaveBeenCalledWith(menuItemId, updateData);
      expect(result).toEqual(updatedItem);
    });

    it('should throw NotFoundError if menu item does not exist', async () => {
      const vendorId = 1;
      const menuItemId = 999;
      const updateData = { name: 'Updated Item' };

      mockMenuItemRepository.getMenuItem.mockResolvedValue(null);

      await expect(menuItemService.updateMenuItem(vendorId, menuItemId, updateData)).rejects.toThrow(NotFoundError);
      expect(mockMenuItemRepository.updateMenuItem).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError if vendor does not own the menu item', async () => {
      const vendorId = 1;
      const menuItemId = 1;
      const updateData = { name: 'Updated Item' };

      const existingItem = {
        id: 1,
        vendor_id: 2,
        name: 'Pizza',
      };

      mockMenuItemRepository.getMenuItem.mockResolvedValue(existingItem);

      await expect(menuItemService.updateMenuItem(vendorId, menuItemId, updateData)).rejects.toThrow(ForbiddenError);
      expect(mockMenuItemRepository.updateMenuItem).not.toHaveBeenCalled();
    });
  });

  describe('deleteMenuItem', () => {
    it('should delete menu item when vendor owns it', async () => {
      const vendorId = 1;
      const menuItemId = 1;

      const existingItem = {
        id: 1,
        vendor_id: vendorId,
        name: 'Pizza',
      };

      mockMenuItemRepository.getMenuItem.mockResolvedValue(existingItem);
      mockMenuItemRepository.deleteMenuItem.mockResolvedValue(1);

      await menuItemService.deleteMenuItem(vendorId, menuItemId);

      expect(mockMenuItemRepository.getMenuItem).toHaveBeenCalledWith(menuItemId);
      expect(mockMenuItemRepository.deleteMenuItem).toHaveBeenCalledWith(menuItemId);
    });

    it('should throw NotFoundError if menu item does not exist', async () => {
      const vendorId = 1;
      const menuItemId = 999;

      mockMenuItemRepository.getMenuItem.mockResolvedValue(null);

      await expect(menuItemService.deleteMenuItem(vendorId, menuItemId)).rejects.toThrow(NotFoundError);
      expect(mockMenuItemRepository.deleteMenuItem).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError if vendor does not own the menu item', async () => {
      const vendorId = 1;
      const menuItemId = 1;

      const existingItem = {
        id: 1,
        vendor_id: 2,
        name: 'Pizza',
      };

      mockMenuItemRepository.getMenuItem.mockResolvedValue(existingItem);

      await expect(menuItemService.deleteMenuItem(vendorId, menuItemId)).rejects.toThrow(ForbiddenError);
      expect(mockMenuItemRepository.deleteMenuItem).not.toHaveBeenCalled();
    });
  });
});

