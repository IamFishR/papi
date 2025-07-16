'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Make notification_method_id nullable to simplify alerts
    await queryInterface.changeColumn('st_alerts', 'notification_method_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'st_notification_methods',
        key: 'id',
      },
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert notification_method_id back to not null
    await queryInterface.changeColumn('st_alerts', 'notification_method_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'st_notification_methods',
        key: 'id',
      },
    });
  }
};
