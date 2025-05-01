const db = require('../config/db');

class Equipment {
    // Lấy tất cả thiết bị
    static async findAll() {
        const query = 'SELECT MTB, Name_s, Amount, Status,  MSSV_Equipment, MSNV_Staff_Equipment  FROM EQUIPMENT';
        const [rows] = await db.query(query);
        return rows;
    }

    // Tìm thiết bị theo ID
    static async findByPk(id) {
        const query = 'SELECT * FROM EQUIPMENT WHERE MTB = ?';
        const [rows] = await db.query(query, [id]);
        return rows[0] || null;
    }

    // Tạo thiết bị mới
    static async create({ Name_s, Amount, Status }) {
        // Lấy MTB lớn nhất và tăng lên 1
        const [maxResult] = await db.query('SELECT MAX(MTB) as maxMTB FROM EQUIPMENT');
        const newMTB = maxResult[0].maxMTB ? maxResult[0].maxMTB + 1 : 500;

        const query = 'INSERT INTO EQUIPMENT (MTB, Name_s, Amount, Status) VALUES (?, ?, ?, ?)';
        await db.query(query, [newMTB, Name_s, Amount, Status]);
        
        return { MTB: newMTB, Name_s, Amount, Status };
    }

    // Cập nhật thiết bị
    static async update(id, Status) {
        const query = 'UPDATE EQUIPMENT SET Status = ? WHERE MTB = ?';
        const [result] = await db.query(query, [Status, id]);
        return result.affectedRows;
    }

    // Xóa thiết bị
    static async delete(id) {
        const query = 'DELETE FROM EQUIPMENT WHERE MTB = ?';
        const [result] = await db.query(query, [id]);
        return result.affectedRows;
    }

    // Mượn thiết bị
    static async borrow(equipmentId, studentId) {
        try {
            console.log(equipmentId);
            console.log(studentId);
            const [equipment] = await db.query(
              `SELECT Status FROM EQUIPMENT WHERE MTB = ?`,
              [equipmentId]
            );

            console.log(equipment[0]);
            if (!equipment[0]) {
              throw new Error('Không tìm thấy thiết bị');
            }
            if (equipment[0].Status === "Hỏng" ) {
              throw new Error('Thiết bị không sẵn sàng để mượn');
            }
      
            const timeStart = new Date();
            const timeEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 ngày
      
            const [result] = await db.query(
              `UPDATE EQUIPMENT 
               SET Status = ?, MSSV_Equipment = ?, TimeStart = ?, TimeEnd = ? 
               WHERE MTB = ?`,
              ['Đang sử dụng', studentId, timeStart, timeEnd, equipmentId]
            );
      
            if (result.affectedRows === 0) {
              throw new Error('Không thể cập nhật thiết bị');
            }
      
            return await Equipment.findByPk(equipmentId);
          } catch (error) {
            throw new Error(`Error borrowing equipment: ${error.message}`);
          }
        }

        async return (equipmentId, studentId) {
            try {
              const [equipment] = await db.query(
                `SELECT Status, MSSV_Equipment FROM EQUIPMENT WHERE MTB = ?`,
                [equipmentId]
              );
        
              if (!equipment[0]) {
                throw new Error('Không tìm thấy thiết bị');
              }
              if (equipment[0].Status !== 'Đang sử dụng') {
                throw new Error('Thiết bị không đang được mượn');
              }
              if (equipment[0].MSSV_Equipment !== studentId) {
                throw new Error('Thiết bị không được mượn bởi sinh viên này');
              }
        
              const [result] = await db.query(
                `UPDATE EQUIPMENT 
                 SET Status = ?, MSSV_Equipment = ?, TimeStart = ?, TimeEnd = ? 
                 WHERE MTB = ?`,
                ['Sẵn sàng', null, null, null, equipmentId]
              );
        
              if (result.affectedRows === 0) {
                throw new Error('Không thể cập nhật thiết bị');
              }
        
              return await Equipment.findById(equipmentId);
            } catch (error) {
              throw new Error(`Error returning equipment: ${error.message}`);
            }
          }
    
};

module.exports = Equipment;