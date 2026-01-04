import express from 'express';
import validate from '../middlewares/validate.js';
import authCustomer from '../middlewares/authCustomer.js';
import authVendor from '../middlewares/authVendor.js';
import notFound from '../middlewares/notFound.js';
import errorHandler from '../middlewares/errorHandler.js';
import { createCustomerSchema, updateCustomerSchema, authenticateCustomerSchema } from '../validators/customer.js';
import { createVendorSchema, updateVendorSchema, authenticateVendorSchema } from '../validators/vendor.js';
import { createMenuItemsSchema, updateMenuItemSchema } from '../validators/menu_item.js';
import checkVendorOwnership from '../middlewares/checkVendorOwnership.js';

export default async ({ app, container }) => {
  const router = express.Router();

  app.use('/api', router);

  const customerController = container.resolve('customerController');
  const vendorController = container.resolve('vendorController');
  const menuItemController = container.resolve('menuItemController');
  const menuItemRepository = container.resolve('menuItemRepository');

  // Public routes - Customers
  router.post('/customers', validate(createCustomerSchema), customerController.createCustomer.bind(customerController));
  router.post('/customers/auth', validate(authenticateCustomerSchema), customerController.authenticateCustomer.bind(customerController));
  router.get('/customers', customerController.getCustomers.bind(customerController));

  // Protected routes - Customers (require customer authentication)
  router.put('/customers/me', authCustomer, validate(updateCustomerSchema), customerController.updateCustomer.bind(customerController));
  router.get('/customers/me', authCustomer, customerController.getCustomer.bind(customerController));

  // Public routes - Vendors
  router.post('/vendors', validate(createVendorSchema), vendorController.createVendor.bind(vendorController));
  router.post('/vendors/auth', validate(authenticateVendorSchema), vendorController.authenticateVendor.bind(vendorController));
  router.get('/vendors', vendorController.getVendors.bind(vendorController));
  router.get('/vendors/:id', vendorController.getVendor.bind(vendorController));

  router.put('/vendors/:id', authVendor, validate(updateVendorSchema), vendorController.updateVendor.bind(vendorController));

  router.get('/menu-items', menuItemController.getVendorMenuItems.bind(menuItemController));
  router.get('/menu-items/:id', menuItemController.getMenuItem.bind(menuItemController));

  router.post('/menu-items', authVendor, validate(createMenuItemsSchema), menuItemController.createMenuItems.bind(menuItemController));
  router.put('/menu-items/:id', authVendor, checkVendorOwnership(menuItemRepository), validate(updateMenuItemSchema), menuItemController.updateMenuItem.bind(menuItemController));
  router.delete('/menu-items/:id', authVendor, checkVendorOwnership(menuItemRepository), menuItemController.deleteMenuItem.bind(menuItemController));


  app.use(notFound);
  app.use(errorHandler);

  return router;
};