import User from './userModel.js';
import Branch from './branchModel.js';
import QrCode from './qrModel.js';
import Admin from './adminModel.js'; 

// Define the associations after models are imported
User.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Branch.hasMany(User, { foreignKey: 'branch_id', as: 'users' });

User.hasMany(QrCode, { foreignKey: 'user_id', as: 'qrCodes' });
QrCode.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

QrCode.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Branch.hasMany(QrCode, { foreignKey: 'branch_id', as: 'qrCodes' });

// Add association between Admin and User
Admin.hasMany(User, { foreignKey: 'admin_id', as: 'users' }); // An admin manages many users
User.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' }); // Each user belongs to an admin

Admin.hasMany(Branch, { foreignKey: 'admin_id', as: 'branches' });
Branch.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' });
