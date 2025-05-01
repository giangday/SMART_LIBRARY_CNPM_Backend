const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/bookingController');
const { protect, studentOnly } = require('../middleware/auth');

// Đặt phòng
router.post('/', protect, studentOnly, reservationController.bookRoom);

// Hủy đặt phòng
router.patch('/cancel', protect, studentOnly, reservationController.cancelBooking);

// Check-in
router.patch('/check-in', protect, studentOnly, reservationController.checkIn);

// Check-out
router.patch('/check-out', protect, studentOnly, reservationController.checkOut);

module.exports = router;