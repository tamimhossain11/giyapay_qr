import { DataTypes } from 'sequelize';
import sequelize from '../databse/connection.js';
import Admin from '../model/adminModel.js';

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
  admin_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Admin, // Assuming you have an Admin table/model
      key: 'id',
    },
    allowNull: false, // Make it required if needed
  },
}, {
  tableName: 'branches',
  timestamps: true,
});

export default Branch;
