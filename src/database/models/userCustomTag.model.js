/**
 * User Custom Tag model definition
 */
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserCustomTag = sequelize.define('UserCustomTag', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },    userId: {
      type: DataTypes.UUID,
      allowNull: true, // Changed to true to allow ON DELETE SET NULL
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    tagName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'tag_name',
    },
    tagType: {
      type: DataTypes.ENUM('strategy', 'emotion', 'mistake', 'exitReason', 'instrumentWatchlist', 'setupCondition'),
      allowNull: false,
      field: 'tag_type',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at',
      allowNull: true,
    },
  }, {
    tableName: 'user_custom_tags',
    timestamps: true,
    underscored: true,
    paranoid: true, // Enables soft deletes
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['tag_type'],
      },
      {
        unique: true,
        fields: ['user_id', 'tag_name', 'tag_type'],
      },
    ],
  });

  UserCustomTag.associate = (models) => {
    // UserCustomTag belongs to a User
    UserCustomTag.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return UserCustomTag;
};
