/**
 * Stock Alert Technical Indicators migration
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('st_technical_indicators', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      stock_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'st_stocks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      indicator_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'st_indicator_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      calculation_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      value: {
        type: Sequelize.DECIMAL(15, 6),
        allowNull: false,
      },
      parameters: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      time_period: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      signal_strength: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      is_bullish: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      is_bearish: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
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

    // Add unique constraint to prevent duplicate indicators for the same stock, type, and date
    await queryInterface.addConstraint('st_technical_indicators', {
      fields: ['stock_id', 'indicator_type_id', 'calculation_date', 'time_period'],
      type: 'unique',
      name: 'unique_technical_indicator',
    });

    // Add indexes for improved performance
    await queryInterface.addIndex('st_technical_indicators', ['stock_id']);
    await queryInterface.addIndex('st_technical_indicators', ['indicator_type_id']);
    await queryInterface.addIndex('st_technical_indicators', ['calculation_date']);
    await queryInterface.addIndex('st_technical_indicators', ['is_bullish']);
    await queryInterface.addIndex('st_technical_indicators', ['is_bearish']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('st_technical_indicators');
  },
};
