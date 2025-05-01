const pool = require('../config/db');

const Notification = {
    async create({ reservationId, userId, adminId, content, type }) {
        await pool.query(
            'INSERT INTO NOTIFICATION (ReservationID, UserID, AdminID, Content, Type) VALUES (?, ?, ?, ?, ?)',
            [reservationId, userId, adminId, content, type]
        );
    }
};

module.exports = Notification;