const db = require('../config/db');

const Reservation = {
    async create(userId, NoRoom,Location,Building,  StartTime, EndTime) {
        const [result] = await db.query(
            'INSERT INTO RESERVATION (UserID, NoRoom,Location,Building, StartTime, EndTime, Status) VALUES (?, ?, ?, ?, ?,?,?)',
            [userId, NoRoom,Location,Building, StartTime, EndTime, 'Pending']
        );

        console.log(result);
        await db.query(
            `UPDATE SPACE_ROOM 
             SET Emptys = Emptys - 1, NoEmpty = NoEmpty + 1
             WHERE NoRoom = ?`,[NoRoom]
          );
        const [reservation] = await db.query(
            `SELECT * FROM RESERVATION WHERE ReservationID = ?`,
            [result.insertId]
          );
        return reservation[0];
    },

    async checkConflict(roomId, timeSlotStart, timeSlotEnd) {
        const [rows] = await pool.query(
            'SELECT * FROM RESERVATION WHERE RoomID = ? AND Status IN ("Booked", "CheckedIn") AND ((TimeSlotStart <= ? AND TimeSlotEnd >= ?) OR (TimeSlotStart <= ? AND TimeSlotEnd >= ?))',
            [roomId, timeSlotStart, timeSlotStart, timeSlotEnd, timeSlotEnd]
        );
        return rows.length > 0;
    },

    async cancel(reservationId, userId) {
        // Kiểm tra đặt phòng
      const [reservation] = await db.query(
        `SELECT UserID, NoRoom, Location, Building, Status 
         FROM RESERVATION 
         WHERE ReservationID = ?`,
        [reservationId]
      );

      if (reservation[0].UserID !== userId) {
        throw new Error('Bạn không có quyền hủy đặt phòng này');
      }
      if (reservation[0].Status !== 'Pending' && reservation[0].Status !== 'Confirmed') {
        throw new Error('Chỉ có thể hủy đặt phòng đang ở trạng thái Pending hoặc Confirmed');
      }

     // Cập nhật trạng thái đặt phòng
     await db.query(
        `UPDATE RESERVATION 
         SET Status = 'Completed'
         WHERE ReservationID = ?`,
        [reservationId]
      );

      await db.query(
        `UPDATE SPACE_ROOM 
         SET Emptys = Emptys + 1, NoEmpty = NoEmpty - 1
         WHERE NoRoom = ?`,
        [reservation[0].NoRoom]
      );

      const [updatedReservation] = await db.query(
        `SELECT * FROM RESERVATION WHERE ReservationID = ?`,
        [reservationId]
      );
      return updatedReservation[0];
    },

    async findByUser(userId) {
        const [rows] = await pool.query(
            'SELECT * FROM RESERVATION WHERE UserID = ? ORDER BY CreatedAt DESC',
            [userId]
        );
        return rows;
    },

    async checkIn(reservationId, userId){
        const [reservation] = await db.query(
            `SELECT UserID, Status, StartTime 
             FROM RESERVATION 
             WHERE ReservationID = ?`,
            [reservationId]
          );

        if (reservation[0].UserID !== userId) {
            throw new Error('Bạn không có quyền check-in đặt phòng này');
          }
        if (reservation[0].Status !== 'Pending') {
            throw new Error('Chỉ có thể check-in đặt phòng ở trạng thái Pending');
          }

        await db.query(
            `UPDATE RESERVATION 
             SET Status = 'Confirmed'
             WHERE ReservationID = ?`,
            [reservationId]
          );
        
        const [updatedReservation] = await db.query(
            `SELECT * FROM RESERVATION WHERE ReservationID = ?`,
            [reservationId]
          );
          return updatedReservation[0];
    },

    async checkOut(reservationId, userId){

        // Kiểm tra đặt phòng
        const [reservation] = await db.query(
        `SELECT UserID, Status, NoRoom, Location, Building 
         FROM RESERVATION 
         WHERE ReservationID = ?`,
        [reservationId]
      );

        if (reservation[0].UserID !== userId) {
            throw new Error('Bạn không có quyền check-out đặt phòng này');
        }
        if (reservation[0].Status !== 'Confirmed') {
            throw new Error('Chỉ có thể check-out đặt phòng ở trạng thái Confirmed');
        }
        await db.query(
            `UPDATE RESERVATION 
             SET Status = 'Completed'
             WHERE ReservationID = ?`,
            [reservationId]);

          await db.query(
            `UPDATE SPACE_ROOM 
             SET Emptys = Emptys + 1, NoEmpty = NoEmpty - 1
             WHERE NoRoom = ?`,
            [reservation[0].NoRoom]);

        const [updatedReservation] = await db.query(
            `SELECT * FROM RESERVATION WHERE ReservationID = ?`,
            [reservationId]
          );
        return updatedReservation[0];  
    }

};

module.exports = Reservation;