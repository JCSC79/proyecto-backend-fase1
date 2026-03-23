/**
 * @param { import("knex").Knex } knex
 */

exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary(); 
    table.string('email').notNullable().unique(); // Email can't be null and must be unique
    table.string('password').notNullable(); 
    table.string('role').defaultTo('USER'); // For RBAC (Admin/User)
    table.timestamp('createdAt').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};