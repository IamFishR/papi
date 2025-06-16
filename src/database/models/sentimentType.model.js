/**
 * SentimentType model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SentimentType = sequelize.define('SentimentType', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 50],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'st_sentiment_types',
    timestamps: true,
    underscored: true,
  });

  // Define associations in the associate method
  SentimentType.associate = (models) => {
    // Will be associated with Alert and NewsMention models when created
  };

  return SentimentType;
};
