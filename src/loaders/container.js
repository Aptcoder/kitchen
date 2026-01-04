import { createContainer, InjectionMode, asClass, asValue } from 'awilix';
import CustomerController from '../controllers/customer.js';
import CustomerService from '../services/customer.js';
import CustomerRepository from '../repositories/customer.js';
import VendorController from '../controllers/vendor.js';
import VendorService from '../services/vendor.js';
import VendorRepository from '../repositories/vendor.js';

export default async (db) => {
    const container = createContainer({
        injectionMode: InjectionMode.PROXY,
    });

    container.register({
        customerController: asClass(CustomerController),
        customerService: asClass(CustomerService),
        customerRepository: asClass(CustomerRepository),
        vendorController: asClass(VendorController),
        vendorService: asClass(VendorService),
        vendorRepository: asClass(VendorRepository),
        db: asValue(db),
    });

    return container;
};