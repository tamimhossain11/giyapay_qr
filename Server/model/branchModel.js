import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';
import Admin from '../model/adminModel.js';

const Branch = sequelize.define('Branch', {
  branch_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  bank_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bank_branch: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  admin_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Admin,
      key: 'id',
    },
    allowNull: false,
  },
}, {
  tableName: 'branches',
  timestamps: true,
});

export default Branch;
