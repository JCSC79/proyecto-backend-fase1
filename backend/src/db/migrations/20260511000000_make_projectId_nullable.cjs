/**
 * Migration: ensure "projectId" is nullable on tasks table.
 *
 * This migration was originally written to fix a column that was added
 * manually without a migration. On a fresh database this migration 2
 * already adds the column as nullable, so this is a safe no-op for
 * new installs while still fixing any pre-existing NOT NULL constraint.
 *
 * @param { import("knex").Knex } knex
 */
exports.up = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('tasks', 'projectId');
  if (!hasColumn) return; // migration 2 already added it as nullable — nothing to do

  // Use raw SQL to make the column nullable without touching its type or default.
  // knex .alter() requires explicit flags in Knex 3.x and can fail in some PG versions.
  await knex.raw('ALTER TABLE tasks ALTER COLUMN "projectId" DROP NOT NULL');
};

exports.down = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('tasks', 'projectId');
  if (!hasColumn) return;

  await knex.raw('ALTER TABLE tasks ALTER COLUMN "projectId" SET NOT NULL');
};
