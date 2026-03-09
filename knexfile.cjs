/**
 * Knex configuration for Task Manager Backend.
 * Uses PostgreSQL for persistent storage.
 * * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',    // Localhost address for Docker mapping
      port: 5432,           // Default PostgreSQL port
      user: 'postgres',     // Database user defined in docker-compose
      password: 'abc123..', // Database password defined in docker-compose
      database: 'tasks_db'  // Name of the database to connect to
    },
    migrations: {
      directory: './src/db/migrations', // Path to database schema changes
      tableName: 'knex_migrations'      // Table to track migration history
    },
    seeds: {
      directory: './src/db/seeds'      // Path to initial data scripts
    }
  }
};