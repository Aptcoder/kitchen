import express from 'express';
import validate from '../middlewares/validate.js';
import authCustomer from '../middlewares/authCustomer.js';
import authVendor from '../middlewares/authVendor.js';
import notFound from '../middlewares/notFound.js';
import errorHandler from '../middlewares/errorHandler.js';
import { createCustomerSchema, updateCustomerSchema, authenticateCustomerSchema } from '../validators/customer.js';
import { createVendorSchema, updateVendorSchema, authenticateVendorSchema } from '../validators/vendor.js';

export default async ({ app, container }) => {
  const router = express.Router();

  app.use('/api', router);

  const customerController = container.resolve('customerController');
  const vendorController = container.resolve('vendorController');

  // Public routes - Customers
  router.post('/customers', validate(createCustomerSchema), customerController.createCustomer.bind(customerController));
  router.post('/customers/auth', validate(authenticateCustomerSchema), customerController.authenticateCustomer.bind(customerController));
  router.get('/customers', customerController.getCustomers.bind(customerController));

  // Protected routes - Customers (require customer authentication)
  router.put('/customers/:id', authCustomer, validate(updateCustomerSchema), customerController.updateCustomer.bind(customerController));
  router.get('/customers/:id', authCustomer, customerController.getCustomer.bind(customerController));

  // Public routes - Vendors
  router.post('/vendors', validate(createVendorSchema), vendorController.createVendor.bind(vendorController));
  router.post('/vendors/auth', validate(authenticateVendorSchema), vendorController.authenticateVendor.bind(vendorController));
  router.get('/vendors', vendorController.getVendors.bind(vendorController));

  // Protected routes - Vendors (require vendor authentication)
  router.put('/vendors/:id', authVendor, validate(updateVendorSchema), vendorController.updateVendor.bind(vendorController));
  router.get('/vendors/:id', authVendor, vendorController.getVendor.bind(vendorController));


  app.use(notFound);
  app.use(errorHandler);

  return router;
};