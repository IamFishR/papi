/**
 * Initial user seeders
 */
'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {    // Generate hashed password for admin user
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin123!', salt);
    const userPassword = await bcrypt.hash('User123!', salt);

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
        is_email_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        first_name: 'Test',
        last_name: 'User',
        email: 'user@example.com',
        password: userPassword,
        role: 'user',
        is_email_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { 
      email: { 
        [Sequelize.Op.in]: ['admin@example.com', 'user@example.com'] 
      } 
    }, {});
  }
};
