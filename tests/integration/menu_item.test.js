import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from '../helpers/testApp.js';
import { cleanupTestDb, closeTestDb, getTestDb } from '../helpers/testDb.js';
import bcrypt from 'bcrypt';

describe('Menu Item Integration Tests', () => {
  let app;
  let vendor1Token;
  let vendor2Token;
  let vendor1Id;
  let vendor2Id;

  beforeAll(async () => {
    app = await createTestApp();
    const db = await getTestDb();

    const vendor1Password = await bcrypt.hash('password123', 10);
    const vendor2Password = await bcrypt.hash('password123', 10);

    const [vendor1] = await db('vendors').insert({
      name: 'Vendor 1',
      email: 'vendor1@test.com',
      password: vendor1Password,
      address: '123 Main St',
    }).returning('*');

    const [vendor2] = await db('vendors').insert({
      name: 'Vendor 2',
      email: 'vendor2@test.com',
      password: vendor2Password,
      address: '456 Oak Ave',
    }).returning('*');

    vendor1Id = vendor1.id;
    vendor2Id = vendor2.id;

    const authResponse1 = await request(app)
      .post('/api/vendors/auth')
      .send({
        email: 'vendor1@test.com',
        password: 'password123',
      });

    const authResponse2 = await request(app)
      .post('/api/vendors/auth')
      .send({
        email: 'vendor2@test.com',
        password: 'password123',
      });

    vendor1Token = authResponse1.body.data.token;
    vendor2Token = authResponse2.body.data.token;
  });

  afterEach(async () => {
    const db = await getTestDb();
    await db('menu_items').delete();
  });

  afterAll(async () => {
    await cleanupTestDb();
    await closeTestDb();
  });

  describe('POST /api/menu-items', () => {
    it('should create menu items for authenticated vendor', async () => {
      const menuItems = [
        {
          name: 'Pizza Margherita',
          description: 'Classic pizza with tomato and mozzarella',
          price: 1500,
          image: 'https://example.com/pizza.jpg',
        },
        {
          name: 'Burger Deluxe',
          description: 'Juicy burger with all the fixings',
          price: 1200,
          image: 'https://example.com/burger.jpg',
        },
      ];

      const response = await request(app)
        .post('/api/menu-items')
        .set('Authorization', `Bearer ${vendor1Token}`)
        .send(menuItems)
        .expect(201);

      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('MenuItems created successfully');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        name: 'Pizza Margherita',
        description: 'Classic pizza with tomato and mozzarella',
        price: 1500,
        vendor_id: vendor1Id,
      });
      expect(response.body.data[0].id).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const menuItems = [
        {
          name: 'Pizza',
          description: 'Test pizza',
          price: 1500,
          image: 'https://example.com/pizza.jpg',
        },
      ];

      const response = await request(app)
        .post('/api/menu-items')
        .send(menuItems)
        .expect(401);

      expect(response.body.status).toBe(false);
    });
  });

  describe('GET /api/menu-items', () => {
    beforeEach(async () => {
      const db = await getTestDb();
      await db('menu_items').insert([
        {
          name: 'Item 1',
          description: 'Description 1',
          price: 1000,
          image: 'https://example.com/item1.jpg',
          vendor_id: vendor1Id,
        },
        {
          name: 'Item 2',
          description: 'Description 2',
          price: 2000,
          image: 'https://example.com/item2.jpg',
          vendor_id: vendor1Id,
        },
        {
          name: 'Item 3',
          description: 'Description 3',
          price: 3000,
          image: 'https://example.com/item3.jpg',
          vendor_id: vendor1Id,
        },
      ]);
    });

    it('should return paginated menu items with metadata', async () => {
      const response = await request(app)
        .get(`/api/menu-items?vendor_id=${vendor1Id}&page=1&limit=2`)
        .expect(200);

      expect(response.body.status).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should return second page correctly', async () => {
      const response = await request(app)
        .get(`/api/menu-items?vendor_id=${vendor1Id}&page=2&limit=2`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta).toMatchObject({
        page: 2,
        limit: 2,
        total: 3,
        totalPages: 2,
        hasNext: false,
        hasPrev: true,
      });
    });

    it('should return 400 when vendor_id is missing', async () => {
      const response = await request(app)
        .get('/api/menu-items')
        .expect(400);

      expect(response.body.status).toBe(false);
      expect(response.body.message).toContain('Vendor ID is required');
    });
  });

  describe('GET /api/menu-items/:id', () => {
    let menuItemId;

    beforeEach(async () => {
      const db = await getTestDb();
      const [item] = await db('menu_items').insert({
        name: 'Test Item',
        description: 'Test Description',
        price: 1500,
        image: 'https://example.com/test.jpg',
        vendor_id: vendor1Id,
      }).returning('*');
      menuItemId = item.id;
    });

    it('should return menu item by id', async () => {
      const response = await request(app)
        .get(`/api/menu-items/${menuItemId}`)
        .expect(200);

      expect(response.body.status).toBe(true);
      expect(response.body.data).toMatchObject({
        id: menuItemId,
        name: 'Test Item',
        description: 'Test Description',
        price: 1500,
        vendor_id: vendor1Id,
      });
    });

    it('should return 404 when menu item does not exist', async () => {
      const response = await request(app)
        .get('/api/menu-items/99999')
        .expect(404);

      expect(response.body.status).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/menu-items/:id', () => {
    let menuItemId;

    beforeEach(async () => {
      const db = await getTestDb();
      const [item] = await db('menu_items').insert({
        name: 'Original Item',
        description: 'Original Description',
        price: 1000,
        image: 'https://example.com/original.jpg',
        vendor_id: vendor1Id,
      }).returning('*');
      menuItemId = item.id;
    });

    it('should update menu item when vendor owns it', async () => {
      const updateData = {
        name: 'Updated Item',
        price: 2000,
      };

      const response = await request(app)
        .put(`/api/menu-items/${menuItemId}`)
        .set('Authorization', `Bearer ${vendor1Token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe(true);
      expect(response.body.data).toMatchObject({
        id: menuItemId,
        name: 'Updated Item',
        price: 2000,
        vendor_id: vendor1Id,
      });
    });

    it('should return 403 when vendor does not own the menu item', async () => {
      const updateData = {
        name: 'Hacked Item',
        price: 9999,
      };

      const response = await request(app)
        .put(`/api/menu-items/${menuItemId}`)
        .set('Authorization', `Bearer ${vendor2Token}`)
        .send(updateData)
        .expect(403);

      expect(response.body.status).toBe(false);
      expect(response.body.message).toContain('permission');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put(`/api/menu-items/${menuItemId}`)
        .send({ name: 'Test' })
        .expect(401);

      expect(response.body.status).toBe(false);
    });

    it('should return 404 when menu item does not exist', async () => {
      const response = await request(app)
        .put('/api/menu-items/99999')
        .set('Authorization', `Bearer ${vendor1Token}`)
        .send({ name: 'Test' })
        .expect(404);

      expect(response.body.status).toBe(false);
    });
  });

  describe('DELETE /api/menu-items/:id', () => {
    let menuItemId;

    beforeEach(async () => {
      const db = await getTestDb();
      const [item] = await db('menu_items').insert({
        name: 'Item to Delete',
        description: 'Will be deleted',
        price: 1000,
        image: 'https://example.com/delete.jpg',
        vendor_id: vendor1Id,
      }).returning('*');
      menuItemId = item.id;
    });

    it('should delete menu item when vendor owns it', async () => {
      const response = await request(app)
        .delete(`/api/menu-items/${menuItemId}`)
        .set('Authorization', `Bearer ${vendor1Token}`)
        .expect(200);

      expect(response.body.status).toBe(true);
      expect(response.body.message).toContain('deleted successfully');

      const db = await getTestDb();
      const deletedItem = await db('menu_items').where('id', menuItemId).first();
      expect(deletedItem).toBeUndefined();
    });

    it('should return 403 when vendor does not own the menu item', async () => {
      const response = await request(app)
        .delete(`/api/menu-items/${menuItemId}`)
        .set('Authorization', `Bearer ${vendor2Token}`)
        .expect(403);

      expect(response.body.status).toBe(false);
      expect(response.body.message).toContain('permission');

      const db = await getTestDb();
      const item = await db('menu_items').where('id', menuItemId).first();
      expect(item).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .delete(`/api/menu-items/${menuItemId}`)
        .expect(401);

      expect(response.body.status).toBe(false);
    });

    it('should return 404 when menu item does not exist', async () => {
      const response = await request(app)
        .delete('/api/menu-items/99999')
        .set('Authorization', `Bearer ${vendor1Token}`)
        .expect(404);

      expect(response.body.status).toBe(false);
    });
  });
});

