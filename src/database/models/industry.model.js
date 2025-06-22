/**
 * Industry model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Industry = sequelize.define('Industry', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sectorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'sector_id',
      references: {
        model: 'st_sectors',
        key: 'id',
      },
      validate: {
        notEmpty: true,
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
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
    tableName: 'st_industries',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['sector_id'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['name'],
      },
    ],
  });

  Industry.associate = (models) => {
    // Industry belongs to a sector
    if (models.Sector) {
      Industry.belongsTo(models.Sector, {
        foreignKey: 'sector_id',
        as: 'sector',
      });
    }

    // Industry has many stocks
    if (models.Stock) {
      Industry.hasMany(models.Stock, {
        foreignKey: 'industry_id',
        as: 'stocks',
      });
    }
  };

  return Industry;
};