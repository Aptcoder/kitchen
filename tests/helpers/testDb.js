import knex from 'knex';

let testDb = null;

export const getTestDb = async () => {
  if (testDb) {
    return testDb;
  }

  testDb = knex({
    client: 'better-sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
  });

  await testDb.schema.createTable('customers', (table) => {
    table.increments('id').primary();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.timestamps(true, true);
  });

  await testDb.schema.createTable('vendors', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('address').nullable();
    table.string('phone').nullable();
    table.timestamps(true, true);
  });

  await testDb.schema.createTable('menu_items', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('description').nullable();
    table.integer('price').notNullable();
    table.string('image').nullable();
    table.integer('vendor_id').references('id').inTable('vendors').notNullable();
    table.timestamps(true, true);
  });

  return testDb;
};

export const cleanupTestDb = async () => {
  if (testDb) {
    await testDb.schema.dropTableIfExists('menu_items');
    await testDb.schema.dropTableIfExists('vendors');
    await testDb.schema.dropTableIfExists('customers');
  }
};

export const closeTestDb = async () => {
  if (testDb) {
    await testDb.destroy();
    testDb = null;
  }
};

