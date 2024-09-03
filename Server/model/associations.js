import User from './userModel.js';
import QrCode from './qrModel.js';
import Branch from './branchModel.js';

// Define the associations after models are imported
User.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
User.hasMany(QrCode, { foreignKey: 'user_id', as: 'qrCodes' });

QrCode.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
QrCode.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });

Branch.hasMany(User, { foreignKey: 'branch_id', as: 'users' });
Branch.hasMany(QrCode, { foreignKey: 'branch_id', as: 'qrCodes' });
