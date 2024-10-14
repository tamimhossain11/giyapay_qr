import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

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
  merchant_id: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  merchant_secret: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  merchant_name: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
}, {
  tableName: 'admin', 
  timestamps: false,
});

export default Admin;
