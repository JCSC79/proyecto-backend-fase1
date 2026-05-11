/**
 * Stub for migration that was applied to the database on 2026-05-07.
 * This migration added a 'projects' table and a 'projectId' FK column to 'tasks'.
 * * @param { import("knex").Knex } knex
 */
exports.up = async function(knex) {
  // Already applied — this is a recovery stub.
};

exports.down = async function(knex) {
  // No-op stub for rollback safety.
};