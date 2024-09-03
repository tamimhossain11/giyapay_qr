import { Sequelize } from 'sequelize';
import sequelize from '../databse/connection.js';
import User from './userModel.js';
import Branch from './branchModel.js';
import QrCode from './qrCodesModel.js';

const models = {
  User: User,
  Branch: Branch,
  QrCode: QrCode,
};

models.User.belongsTo(models.Branch, {
  foreignKey: 'branch_id',
  as: 'branch',
});

models.Branch.hasOne(models.User, {
  foreignKey: 'branch_id',
  as: 'user',
});

models.User.hasMany(models.QrCode, {
  foreignKey: 'user_id',
  as: 'qrCodes',
});

models.Branch.hasMany(models.QrCode, {
  foreignKey: 'branch_id',
  as: 'qrCodes',
});

models.QrCode.belongsTo(models.User, {
  foreignKey: 'user_id',
  as: 'user',
});

models.QrCode.belongsTo(models.Branch, {
  foreignKey: 'branch_id',
  as: 'branch',
});

// Export all models
export default models;
export { sequelize };
