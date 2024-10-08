import { DataTypes } from 'sequelize';
import sequelize from '../databse/connection.js';

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  merchant_name: {
    type: DataTypes.STRING,
    allowNull: false, // Make this required as the merchant is tied to the admin
  },
  merchant_secret: {
    type: DataTypes.STRING,
    allowNull: false, // The secret associated with the merchant
  },
}, {
  tableName: 'admin', 
  timestamps: false,
});

export default Admin;
