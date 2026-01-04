import { ForbiddenError, NotFoundError } from '../utils/errors.js';

export default (menuItemRepository) => {
    return async (req, res, next) => {
        const menuItemId = req.params.id;
        const vendorId = req.vendor.id;

        const menuItem = await menuItemRepository.getMenuItem(menuItemId);
        
        if (!menuItem) {
            throw new NotFoundError('Menu item not found');
        }

        if (menuItem.vendor_id !== vendorId) {
            throw new ForbiddenError('You do not have permission to access this menu item');
        }

        next();
    };
};

