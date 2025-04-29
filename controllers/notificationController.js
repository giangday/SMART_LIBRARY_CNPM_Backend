const Notification = require('../models/notificationModel');
const Equipment = require('../models/equipmentModel');
exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { MSSV_Notification: req.params.userId }, // Sửa lại tên trường
            attributes: ['STT', 'Content', 'Read_s'] // Chỉ định rõ các trường cần lấy
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            details: "Kiểm tra lại tên cột trong model và database"
        });
    }
};
exports.createNotification = async (req, res) => {
    try {
        const { userId, title, message, type, relatedEntity, relatedEntityId } = req.body;
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            relatedEntity,
            relatedEntityId
        });
        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        await notification.update({ isRead: true });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        await notification.destroy();
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.sendEquipmentReport = async (req, res) => {
    try {
        // 1. Lấy thống kê thiết bị
        const usedEquipment = await Equipment.findAll({
            where: { Status: 'Đang sử dụng' },
            attributes: ['MTB', 'Name_s', 'MSSV_Equipment'],
            include: [{
                model: Student,
                attributes: ['FullName'],
                where: { MSSV: sequelize.col('Equipment.MSSV_Equipment') }
            }]
        });

        // 2. Tạo nội dung thông báo
        const reportContent = `Thống kê thiết bị đang mượn:\n` +
            usedEquipment.map(e =>
                `- ${e.Name_s} (MTB: ${e.MTB}) do ${e.Student.FullName} mượn`
            ).join('\n');

        // 3. Tạo thông báo
        const notification = await Notification.create({
            Statistical: 'Thống kê thiết bị',
            Content: reportContent,  // Đảm bảo có giá trị
            Date_s: new Date(),
            Read_s: 'F',
            News: 'T',
            MSSV_Notification: null,
            MSNV_Admin_Notification: 30001  // ID admin
        });

        res.json({
            notification,
            equipmentCount: usedEquipment.length
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            error: error.message,
            details: error.errors?.map(e => e.message)
        });
    }
};