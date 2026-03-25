const crypto = require('crypto');
const bcrypt = require('bcrypt');

/**
 * DEFAULT USERS SEED
 * Creates default admin and regular users for testing and development.
 * Run with: npm run db:seed
 */
exports.seed = async function(knex) {
  // Clean existing users (optional - comment out if you want to keep existing users)
  // await knex('users').del();

  const users = [];
  const saltRounds = 10;

  console.log('[!] Creating default users for testing...');

  // Default Admin User
  const adminExists = await knex('users').where({ email: 'admin@test.com' }).first();
  if (!adminExists) {
    const adminPassword = await bcrypt.hash('AdminPassword123!', saltRounds);
    users.push({
      id: crypto.randomUUID(),
      email: 'admin@test.com',
      password: adminPassword,
      role: 'ADMIN',
      createdAt: new Date(),
    });
    console.log('[+] Admin user will be created');
  } else {
    console.log('[!] Admin user already exists, skipping...');
  }

  // Default Regular User
  const userExists = await knex('users').where({ email: 'user@test.com' }).first();
  if (!userExists) {
    const userPassword = await bcrypt.hash('UserPassword123!', saltRounds);
    users.push({
      id: crypto.randomUUID(),
      email: 'user@test.com',
      password: userPassword,
      role: 'USER',
      createdAt: new Date(),
    });
    console.log('[+] Regular user will be created');
  } else {
    console.log('[!] Regular user already exists, skipping...');
  }

  // Insert new users
  if (users.length > 0) {
    await knex('users').insert(users);
    console.log(`[+] Success! ${users.length} new users created.`);
    console.log('');
    console.log('📋 Default Credentials:');
    console.log('   Admin:  admin@test.com / AdminPassword123!');
    console.log('   User:   user@test.com / UserPassword123!');
  } else {
    console.log('[!] All default users already exist.');
  }
};