

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const {
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_DIALECT
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    dialect: DB_DIALECT,
    dialectOptions: {
        socketPath: DB_HOST,  // Set the Unix socket path for Cloud SQL Auth Proxy
    },
    logging: false,  // Disable logging or set to true for debugging
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