const Reservation = require('../models/bookingModel');
const Notification = require('../models/notificationModel');
const db = require('../config/db');

const reservationController = {
    async bookRoom(req, res) {
        try {
            const { NoRoom, Location, Building, StartTime, EndTime } = req.body;
            const userId = req.user.UserID;
            const start = new Date(StartTime);
            const end = new Date(EndTime);

            // Kiểm tra xung đột thời gian
            const [conflicts] = await db.query(
                `SELECT ReservationID FROM RESERVATION 
                WHERE NoRoom = ? AND Location = ? AND Building = ? 
                AND Status IN ('Pending', 'Confirmed')
                AND ((StartTime <= ? AND EndTime >= ?) OR(StartTime <= ? AND EndTime >= ?) OR (StartTime >= ? AND EndTime <= ?))`,
            [NoRoom, Location, Building, start, start, end, end, start, end]);
            if (conflicts.length > 0) {
                throw new Error('Thời gian đặt phòng bị trùng lặp');
            }

             const reservation = await Reservation.create(userId, NoRoom, Location, Building, StartTime, EndTime)
            
             res.status(201).json({
                success: true,
                message: 'Đặt phòng thành công',
                reservation,
                // notification: {
                //   id: notificationResult.insertId,
                //   content: `Bạn đã đặt phòng ${NoRoom} (${Location}, ${Building}) từ ${StartTime} đến ${EndTime}`,
                // },
              });
        } catch (error) {
            res.status(500).json({ message: 'Error booking room', error: error.message });
        }
    },

    async cancelBooking(req, res) {
        try {
            const { reservationId } = req.body;
            const UserID = req.user.UserID;
            console.log(reservationId, req.user.userId);
            const reservation = await Reservation.cancel(reservationId, UserID);
            // await Notification.create({
            //     reservationId,
            //     userId,
            //     content: `Booking ${reservationId} cancelled`,
            //     type: 'Cancellation'
            // });
            res.status(200).json({
                success: true,
                message: 'Hủy đặt phòng thành công',
                reservation,
                // notification: {
                //   id: notificationResult.insertId,
                //   content: `Bạn đã hủy đặt phòng ${reservation.NoRoom} (${reservation.Location}, ${reservation.Building})`,
                // },
              });
        } catch (error) {
            res.status(500).json({ message: 'Error cancelling booking', error: error.message });
        }
    },

    async getUserBookings(req, res) {
        try {
            const UserID = req.user.UserID;
            const bookings = await Reservation.findByUser(UserID);
            res.json(bookings);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching bookings', error: error.message });
        }
    },

    async checkIn(req, res) {
        try {
            const { ReservationID, QRCheckIn } = req.body;
            const UserID = req.user.UserID;

                // Lấy thông tin đặt phòng
            const [reservation] = await db.query(
            `SELECT UserID, Status, StartTime, NoRoom, Location, Building FROM RESERVATION WHERE ReservationID = ?`,
            [ReservationID]
            );

               // Kiểm tra mã QR
            const [room] = await db.query(
            `SELECT QRCheckIn FROM SPACE_ROOM WHERE NoRoom = ? AND Location = ? AND Building = ?`,
            [reservation[0].NoRoom, reservation[0].Location, reservation[0].Building]
            );
            if (room[0].QRCheckIn !== QRCheckIn) {
                throw new Error('Mã QR không hợp lệ');
              }
            
            const updatedReservation = await Reservation.checkIn(ReservationID, UserID);

            // await Notification.create({
            //     reservationId,
            //     userId,
            //     content: `Check-in successful for Room ${reservations[0].RoomID}`,
            //     type: 'General'
            // });

            res.json({ message: 'Check-in successful' });
        } catch (error) {
            res.status(500).json({ message: 'Error checking in', error: error.message });
        }
    },

    async checkOut(req, res) {
        try {
            const { ReservationID, QRCheckOut } = req.body;
            const UserID = req.user.UserID;

                // Lấy thông tin đặt phòng
            const [reservation] = await db.query(
            `SELECT UserID, Status, NoRoom, Location, Building FROM RESERVATION WHERE ReservationID = ?`,
            [ReservationID]
            );
            
                // Kiểm tra mã QR
            const [room] = await db.query(
            `SELECT QRCheckOut FROM SPACE_ROOM WHERE NoRoom = ? AND Location = ? AND Building = ?`,
            [reservation[0].NoRoom, reservation[0].Location, reservation[0].Building]
            );
            console.log(room[0].QRCheckOut);
            console.log(QRCheckOut);
            if (room[0].QRCheckOut !== QRCheckOut) throw new Error('Mã QR không hợp lệ');

               // Thực hiện check-out
            const updatedReservation = await Reservation.checkOut(ReservationID, UserID);
            // await Notification.create({
            //     reservationId,
            //     userId,
            //     content: `Check-out successful for Room ${reservations[0].RoomID}`,
            //     type: 'General'
            // });

            res.json({ message: 'Check-out successful' });
        } catch (error) {
            res.status(500).json({ message: 'Error checking out', error: error.message });
        }
    }
};

module.exports = reservationController;