/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function(knex) {
  return knex.schema.createTable('menu_items', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('description').nullable();
    table.integer('price').notNullable();
    table.string('image').nullable();
    table.integer('vendor_id').references('id').inTable('vendors').notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  return knex.schema.dropTableIfExists('menu_items');
};
