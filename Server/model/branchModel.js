import { DataTypes } from 'sequelize';
import sequelize from '../databse/connection.js';

const Branch = sequelize.define('Branch', {
  branch_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bank_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bank_branch: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'branches',
  timestamps: true,
});

export default Branch;
