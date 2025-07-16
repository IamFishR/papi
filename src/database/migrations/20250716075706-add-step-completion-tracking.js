'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('trade_journal_entries', 'step_completion_status', {
      type: Sequelize.JSON,
      defaultValue: {
        0: false, // Pre-Trade Plan
        1: false, // Execution & Entry
        2: false, // Exit & Performance
        3: false, // Outcome Review
        4: false, // Psychology Review
        5: false  // Analysis & Learning
      },
      comment: 'JSON object tracking completion status of each step (0-5)'
    });

    await queryInterface.addColumn('trade_journal_entries', 'current_step', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Current step user is on (0-5)'
    });

    await queryInterface.addColumn('trade_journal_entries', 'completed_steps', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Number of steps completed (0-6)'
    });

    await queryInterface.addColumn('trade_journal_entries', 'is_complete', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Whether all steps are completed'
    });

    await queryInterface.addColumn('trade_journal_entries', 'last_updated_step', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Last step that was updated'
    });

    await queryInterface.addColumn('trade_journal_entries', 'step_timestamps', {
      type: Sequelize.JSON,
      defaultValue: {},
      comment: 'JSON object tracking when each step was completed'
    });

    // Add index for filtering by completion status
    await queryInterface.addIndex('trade_journal_entries', ['is_complete'], {
      name: 'idx_trade_journal_entries_is_complete'
    });

    // Add index for filtering by current step
    await queryInterface.addIndex('trade_journal_entries', ['current_step'], {
      name: 'idx_trade_journal_entries_current_step'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('trade_journal_entries', 'idx_trade_journal_entries_is_complete');
    await queryInterface.removeIndex('trade_journal_entries', 'idx_trade_journal_entries_current_step');
    
    await queryInterface.removeColumn('trade_journal_entries', 'step_completion_status');
    await queryInterface.removeColumn('trade_journal_entries', 'current_step');
    await queryInterface.removeColumn('trade_journal_entries', 'completed_steps');
    await queryInterface.removeColumn('trade_journal_entries', 'is_complete');
    await queryInterface.removeColumn('trade_journal_entries', 'last_updated_step');
    await queryInterface.removeColumn('trade_journal_entries', 'step_timestamps');
  }
};
