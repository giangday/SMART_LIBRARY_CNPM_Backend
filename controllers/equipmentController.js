const Equipment = require('../models/equipmentModel');
const { User } = require('../models/userModel');
const db = require('../config/db');
exports.getAllEquipments = async (req, res) => {
    try {
        const equipments = await Equipment.findAll();
        res.json(equipments);
    } catch (error) {
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
};

exports.getEquipmentById = async (req, res) => {
    try {
        const equipment = await Equipment.findByPk(req.params.id);
        if (!equipment) {
            return res.status(404).json({ error: 'Equipment not found' });
        }
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
};

exports.createEquipment = async (req, res) => {
    try {
        const { Name_s, Amount, Status } = req.body;
        
        if (!Name_s || !Amount || !Status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const equipment = await Equipment.create({ Name_s, Amount, Status });
        res.status(201).json(equipment);
    } catch (error) {
        console.error("Error creating equipment:", error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
};

exports.updateEquipment = async (req, res) => {
    try {
        const { Status } = req.body;
        
        if (!Status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        console.log(Status);
        const updated = await Equipment.update(req.params.id, Status);
        
        if (!updated) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        const equipment = await Equipment.findByPk(req.params.id);
        res.json(equipment);
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
};

exports.deleteEquipment = async (req, res) => {
    try {
        const deleted = await Equipment.delete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
};

exports.borrowEquipment = async (req, res) => {
    let connection;
    try {
        const equipmentId = req.params.id;
      const userId = req.user.UserID; // Lấy từ middleware protect

      // Kiểm tra dữ liệu đầu vào
      if (!equipmentId) {
        return res.status(400).json({
          success: false,
          message: 'equipmentId là bắt buộc',
        });
      }
  
      // Lấy MSSV từ UserID
      const mssv = await User.getMSSVByUserID(userId);
      if (!mssv) {
        return res.status(400).json({
          success: false,
          message: 'Người dùng không có MSSV hợp lệ',
        });
      }
  
      // Bắt đầu transaction
      connection = await db.getConnection();
      await connection.beginTransaction();
  
      // Mượn thiết bị
      const equipment = await Equipment.borrow(equipmentId, mssv);
  
      // Tạo thông báo
    //   const [notificationResult] = await connection.query(
    //     `INSERT INTO NOTIFICATION (userId, title, message, type) 
    //      VALUES (?, ?, ?, ?)`,
    //     [
    //       userId,
    //       'Mượn thiết bị thành công',
    //       `Bạn đã mượn thiết bị ${equipment.Name_s} (MTB: ${equipmentId})`,
    //       'borrow',
    //     ]
    //   );
  
      await connection.commit();
  
      res.status(200).json({
        success: true,
        message: 'Mượn thiết bị thành công',
        equipment,
        // notification: {
        //   id: notificationResult.insertId,
        //   userId,
        //   title: 'Mượn thiết bị thành công',
        //   message: `Bạn đã mượn thiết bị ${equipment.Name_s} (MTB: ${equipmentId})`,
        //   type: 'borrow',
        // },
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error borrowing equipment:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi mượn thiết bị',
        error: error.message,
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  };
  
exports.getEquipmentStatusReport = async (req, res) => {
    try {
        const report = await Equipment.getStatusReport();
        res.json(report);
    } catch (error) {
        console.error("Report error:", error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
};

exports.returnEquipment = async (req, res) => {
    let connection;
    try {
      const equipmentId = req.params.id;
      const userId = req.user.UserID;
  
      if (!equipmentId) {
        return res.status(400).json({
          success: false,
          message: 'equipmentId là bắt buộc',
        });
      }
  
      const mssv = await User.getMSSVByUserID(userId);
      if (!mssv) {
        return res.status(400).json({
          success: false,
          message: 'Người dùng không có MSSV hợp lệ',
        });
      }
  
      connection = await db.getConnection();
      await connection.beginTransaction();
  
      const equipment = await Equipment.return(equipmentId, mssv);
  
    //   const [notificationResult] = await connection.query(
    //     `INSERT INTO NOTIFICATION (userId, title, message, type) 
    //      VALUES (?, ?, ?, ?)`,
    //     [
    //       userId,
    //       'Trả thiết bị thành công',
    //       `Bạn đã trả thiết bị ${equipment.Name_s} (MTB: ${equipmentId})`,
    //       'return',
    //     ]
    //   );
  
      await connection.commit();
  
      res.status(200).json({
        success: true,
        message: 'Trả thiết bị thành công',
        equipment,
        // notification: {
        //   id: notificationResult.insertId,
        //   userId,
        //   title: 'Trả thiết bị thành công',
        //   message: `Bạn đã trả thiết bị ${equipment.Name_s} (MTB: ${equipmentId})`,
        //   type: 'return',
        // },
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error returning equipment:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi trả thiết bị',
        error: error.message,
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  };