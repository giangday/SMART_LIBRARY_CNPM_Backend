const express = require('express');
//const cors = require('cors');
const userRouter = require('./router/userRoutes');
const authRoutes = require('./router/auth');
const spaceRouter = require('./router/spaceRouter');
const bookingRouter = require('./router/bookingRouter');
const equipRouter = require('./router/equipmentRouter');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080; 

// Cấu hình CORS
// app.use(cors({
//     origin: process.env.FRONTEND_URL || '*',  // fallback '*' nếu không có FRONTEND_URL
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(express.json());

// Định nghĩa các tuyến API
app.use('/api/user', userRouter);
app.use('/api/auth', authRoutes);
app.use('/api/space', spaceRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/equipment', equipRouter);
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
    console.log(`Server running on port ${port}`);
});
