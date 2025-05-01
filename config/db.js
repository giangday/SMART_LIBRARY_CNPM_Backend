const mysql = require('mysql2');
require('dotenv').config({ path: '/mnt/d/CNPM/smart_library_backend/.env' });


// Tạo connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,   // Đặt mặc định nếu không có giá trị trong .env
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,   // Đảm bảo mật khẩu trống nếu không có trong .env
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,          // Đặt port mặc định nếu không có trong .env
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// // Kiểm tra kết nối và sử dụng connection pool
// pool.getConnection((err, connection) => {
//     if (err) {
//         console.error('Error connecting to MySQL:', err.stack);
//         return;
//     }
//     console.log('Connected to MySQL');
//     // Giải phóng kết nối lại vào pool
//     connection.release();
// });

// Sử dụng Promises để dễ dàng làm việc với async/await
module.exports = pool.promise();
