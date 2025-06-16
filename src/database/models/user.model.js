/**
 * User model definition
 */
const { DataTypes } = require('sequelize');
const { hashPassword } = require('../../core/utils/passwordUtils');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'first_name',
      validate: {
        notEmpty: true,
        len: [2, 50],
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'last_name',
      validate: {
        notEmpty: true,
        len: [2, 50],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [8, 100], // Hashed passwords will be longer
      },
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_email_verified',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    lastLogin: {
      type: DataTypes.DATE,
      field: 'last_login',
    },
    refreshToken: {
      type: DataTypes.STRING,
      field: 'refresh_token',
    },
    phone: {
      type: DataTypes.STRING,
      field: 'phone',
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      field: 'address',
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      field: 'city',
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      field: 'state',
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING,
      field: 'zip_code',
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      field: 'country',
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at',
      allowNull: true,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    paranoid: true, // Enables soft deletes
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await hashPassword(user.password);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await hashPassword(user.password);
        }
      },
    },
  });
  User.associate = (models) => {
    // User can have many orders
    User.hasMany(models.Order, {
      foreignKey: 'user_id',
      as: 'orders',
    });
    
    // User can have many alerts
    if (models.Alert) {
      User.hasMany(models.Alert, {
        foreignKey: 'user_id',
        as: 'alerts',
        onDelete: 'SET NULL',
      });
    }
  };

  return User;
};
