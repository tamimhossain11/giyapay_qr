import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const {
  DB_NAME = 'b7bgzzya3dn20l12obtk',
  DB_USER = 'urvdmdzntkyyepjc',
  DB_PASSWORD = 'ImtuS94qp7K3AVI2V3GU',
  DB_HOST = 'b7bgzzya3dn20l12obtk-mysql.services.clever-cloud.com',
  DB_PORT = 3306,
  DB_DIALECT = 'mysql'
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: parseInt(DB_PORT, 10), // Ensure the port is an integer
    dialect: DB_DIALECT,
    logging: false,
});

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Database Connected Successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();

export default sequelize;
