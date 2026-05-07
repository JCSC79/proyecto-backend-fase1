/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function(knex) {
  // 1. Create the projects table
  await knex.schema.createTable('projects', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.uuid('userId')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE'); // If user is deleted, projects are deleted
    table.timestamp('createdAt').defaultTo(knex.fn.now());
  });

  // 2. Add projectId column to tasks (initially nullable to allow migration)
  await knex.schema.table('tasks', (table) => {
    table.uuid('projectId')
      .references('id')
      .inTable('projects')
      .onDelete('CASCADE');
  });

  // 3. DATA MIGRATION: Create a default project for each existing user
  const users = await knex('users').select('id');
  const crypto = require('crypto');

  for (const user of users) {
    const projectId = crypto.randomUUID();
    
    // Create the "General Project" for this user
    await knex('projects').insert({
      id: projectId,
      name: 'General Project',
      userId: user.id,
      createdAt: new Date()
    });

    // Assign all tasks belonging to this user to their new General Project
    await knex('tasks')
      .where({ userId: user.id })
      .update({ projectId: projectId });
  }

  // 4. Set projectId to NOT NULL now that all tasks have one
  await knex.schema.alterTable('tasks', (table) => {
    table.uuid('projectId').notNullable().alter();
  });
};

exports.down = function(knex) {
  return knex.schema.table('tasks', (table) => {
    table.dropColumn('projectId');
  }).dropTableIfExists('projects');
};