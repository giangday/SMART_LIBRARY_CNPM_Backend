const { Sequelize } = require('sequelize');
require('dotenv').config();

// Tạo instance sequelize mới
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false
    }
);

// Hàm kết nối database
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Kết nối MySQL thành công');

        // Đồng bộ hóa model với database
        await sequelize.sync({ alter: true });
        console.log('Đồng bộ hóa models thành công');
    } catch (error) {
        console.error('Lỗi kết nối database:', error);
        process.exit(1);
    }
};

// Export cả instance sequelize và hàm connectDB
module.exports = { sequelize, connectDB };