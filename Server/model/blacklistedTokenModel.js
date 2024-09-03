import { DataTypes } from 'sequelize';
import sequelize from '../databse/connection.js'; 

const BlacklistedToken = sequelize.define('BlacklistedToken', {
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'BlacklistedTokens', 
    timestamps: true
});

export default BlacklistedToken;
