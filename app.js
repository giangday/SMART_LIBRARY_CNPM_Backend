const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Cấu hình CORS để cho phép frontend truy cập
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Định nghĩa các tuyến API
app.use('/api/users', userRoutes);

// Xử lý lỗi 404
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});