/**
 * User Custom Tag migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_custom_tags', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },      user_id: {
        type: Sequelize.UUID,
        allowNull: true, // Changed to true to allow ON DELETE SET NULL
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Changed from CASCADE to SET NULL
      },
      tag_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tag_type: {
        type: Sequelize.ENUM('strategy', 'emotion', 'mistake', 'exitReason', 'instrumentWatchlist', 'setupCondition'),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add indexes
    await queryInterface.addIndex('user_custom_tags', ['user_id']);
    await queryInterface.addIndex('user_custom_tags', ['tag_type']);
    await queryInterface.addIndex('user_custom_tags', ['user_id', 'tag_name', 'tag_type'], {
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_custom_tags');
  },
};
