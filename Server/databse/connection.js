import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('qr_payment_system', 'admin', 'admin', {
    host: 'localhost',
    dialect: 'mysql',
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
