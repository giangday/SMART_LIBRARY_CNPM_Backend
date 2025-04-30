const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./router/userRouter');
const authRoutes = require('./router/auth');
const reportRoutes = require('./router/reportRouter');

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});