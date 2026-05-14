/**
 * Migration to create projects table and link it to tasks.
 * @param { import("knex").Knex } knex
 */
exports.up = async function(knex) {
  // 1) Create table if not exists
  const hasProjects = await knex.schema.hasTable('projects');
  if (!hasProjects) {
    await knex.schema.createTable('projects', (table) => {
      table.uuid('id').primary();
      table.string('name').notNullable();
      table.uuid('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('createdAt').defaultTo(knex.fn.now());
    });
  }

  // 2) Add column to tasks table if not exists
  const hasProjectId = await knex.schema.hasColumn('tasks', 'projectId');
  if (!hasProjectId) {
    await knex.schema.alterTable('tasks', (table) => {
      table.uuid('projectId').nullable().references('id').inTable('projects').onDelete('SET NULL');
    });
  }
};

exports.down = async function(knex) {
  const hasProjectId = await knex.schema.hasColumn('tasks', 'projectId');
  if (hasProjectId) {
    await knex.schema.alterTable('tasks', (table) => {
      table.dropColumn('projectId');
    });
  }
  await knex.schema.dropTableIfExists('projects');
};