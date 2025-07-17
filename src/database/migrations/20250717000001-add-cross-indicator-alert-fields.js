/**
 * Add cross-indicator comparison fields to alerts table
 */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('st_alerts', 'compare_indicator_type_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'st_indicator_types',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('st_alerts', 'compare_indicator_period', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 20,
    });

    await queryInterface.addColumn('st_alerts', 'secondary_indicator_type_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'st_indicator_types',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('st_alerts', 'secondary_indicator_period', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 14,
    });

    await queryInterface.addColumn('st_alerts', 'secondary_indicator_threshold', {
      type: Sequelize.DECIMAL(12, 4),
      allowNull: true,
    });

    await queryInterface.addColumn('st_alerts', 'secondary_indicator_condition_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'st_indicator_conditions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('st_alerts', 'indicator_period', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 14,
    });

    await queryInterface.addColumn('st_alerts', 'indicator_threshold', {
      type: Sequelize.DECIMAL(12, 4),
      allowNull: true,
    });

    // Add indexes for performance
    await queryInterface.addIndex('st_alerts', ['compare_indicator_type_id']);
    await queryInterface.addIndex('st_alerts', ['secondary_indicator_type_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('st_alerts', 'compare_indicator_type_id');
    await queryInterface.removeColumn('st_alerts', 'compare_indicator_period');
    await queryInterface.removeColumn('st_alerts', 'secondary_indicator_type_id');
    await queryInterface.removeColumn('st_alerts', 'secondary_indicator_period');
    await queryInterface.removeColumn('st_alerts', 'secondary_indicator_threshold');
    await queryInterface.removeColumn('st_alerts', 'secondary_indicator_condition_id');
    await queryInterface.removeColumn('st_alerts', 'indicator_period');
    await queryInterface.removeColumn('st_alerts', 'indicator_threshold');
  },
};