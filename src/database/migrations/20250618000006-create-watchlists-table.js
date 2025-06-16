/**
 * Stock Alert Watchlists migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_watchlists', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for improved performance
    await queryInterface.addIndex('st_watchlists', ['user_id']);
    await queryInterface.addIndex('st_watchlists', ['is_public']);
    await queryInterface.addIndex('st_watchlists', ['is_default']);
    
    // Add constraint to ensure a user can only have one default watchlist
    await queryInterface.addConstraint('st_watchlists', {
      fields: ['user_id', 'is_default'],
      type: 'unique',
      name: 'unique_default_watchlist_per_user',
      where: {
        is_default: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_watchlists');
  },
};
