import { DataTypes } from 'sequelize';
import sequelize from '../databse/connection.js';

const QrCode = sequelize.define('QrCode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  qr_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payment_reference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
  },
  payment_channel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  nonce: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  signature: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  invoice_number: {   // Added new column
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'qr_codes',
  timestamps: false,
});

export default QrCode;
