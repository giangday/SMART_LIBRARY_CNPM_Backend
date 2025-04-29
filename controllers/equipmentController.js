const Equipment = require('../models/equipmentModel');
exports.getAllEquipments = async (req, res) => {
    try {
        const equipments = await Equipment.findAll({
            attributes: ['MTB', 'Name_s', 'Amount', 'Status'] // Chỉ định rõ các trường cần lấy
        });
        res.json(equipments);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        res.status(500).json({ error: error.message });
    }
};

exports.createEquipment = async (req, res) => {
    try {
        // Tìm MTB lớn nhất và tăng 1
        const maxMTB = await Equipment.max('MTB');
        const newMTB = maxMTB ? maxMTB + 1 : 500;

        // Tạo thiết bị với đầy đủ thông tin
        const equipment = await Equipment.create({
            MTB: newMTB,
            Name_s: req.body.Name_s,
            Amount: req.body.Amount,
            Status: req.body.Status
        });

        // Trả về toàn bộ thông tin
        res.status(201).json(equipment);

    } catch (error) {
        console.error("Lỗi khi tạo thiết bị:", error);
        res.status(500).json({
            error: "Internal Server Error",
            details: error.message
        });
    }
};

exports.updateEquipment = async (req, res) => {
    try {
        const [updated] = await Equipment.update(
            { Status: req.body.Status },
            { where: { MTB: req.params.id } }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        const equipment = await Equipment.findByPk(req.params.id);
        res.json(equipment);
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteEquipment = async (req, res) => {
    try {
        const deleted = await Equipment.destroy({
            where: { MTB: req.params.id }
        });

        if (!deleted) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            details: error.message
        });
    }
};
exports.borrowEquipment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { studentId, equipmentId } = req.body;

        // 1. Cập nhật trạng thái thiết bị
        const [updated] = await Equipment.update(
            {
                Status: 'Đang sử dụng',
                MSSV_Equipment: studentId,
                TimeStart: new Date(),
                TimeEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 ngày
            },
            { where: { MTB: equipmentId }, transaction }
        );

        if (!updated) throw new Error('Equipment not found');

        // 2. Tạo notification
        const notification = await Notification.create({
            userId: studentId,
            title: 'Mượn thiết bị thành công',
            message: `Bạn đã mượn thiết bị ${equipmentId}`,
            type: 'borrow'
        }, { transaction });

        await transaction.commit();
        res.json({ equipment: await Equipment.findByPk(equipmentId), notification });

    } catch (error) {
        await transaction.rollback();
        res.status(400).json({ error: error.message });
    }
};