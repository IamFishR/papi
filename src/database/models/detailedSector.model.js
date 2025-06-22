/**
 * DetailedSector model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DetailedSector = sequelize.define('DetailedSector', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    macroSector: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'macro_sector',
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    sector: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    industry: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    basicIndustry: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'basic_industry',
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 50],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'st_detailed_sectors',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['macro_sector'],
      },
      {
        fields: ['sector'],
      },
      {
        fields: ['industry'],
      },
      {
        fields: ['basic_industry'],
      },
      {
        fields: ['code'],
      },
      {
        fields: ['is_active'],
      },
    ],
  });

  DetailedSector.associate = (models) => {
    // DetailedSector has many stocks
    if (models.Stock) {
      DetailedSector.hasMany(models.Stock, {
        foreignKey: 'detailedSectorId',
        as: 'stocks',
      });
    }
  };

  return DetailedSector;
};
