/**
 * @param { import("knex").Knex } knex
 */

exports.up = function(knex) {
  return knex.schema.table('tasks', (table) => {
    // Foreign Key: Conect every task to a user, with cascade delete
    table.uuid('userId').references('id').inTable('users').onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.table('tasks', (table) => {
    table.dropColumn('userId');
  });
};