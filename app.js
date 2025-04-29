const express = require('express');
const cors = require('cors');
const equipmentRoutes = require('./router/equipmentRouter');
const notificationRoutes = require('./router/notificationRouter');
// const userRoutes = require('./routes/user.routes');
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
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Backend is running',
        timestamp: new Date().toISOString()
    });
});
// Định nghĩa các tuyến API
// app.use('/api/users', userRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/notifications', notificationRoutes);

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