const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Equipment = sequelize.define('Equipment', {
    MTB: {  // ← Sửa lại tên khóa chính
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'MTB'  // Ánh xạ đúng tên cột trong DB
    },
    Name_s: {
        type: DataTypes.STRING(100),
        field: 'Name_s',  // Ánh xạ tên cột
        allowNull: false
    },
    Amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0 }
    },
    TimeStart: {
        type: DataTypes.DATE,
        field: 'TimeStart',
        allowNull: true
    },
    TimeEnd: {
        type: DataTypes.DATE,
        field: 'TimeEnd',
        allowNull: true
    },
    Status: {
        type: DataTypes.STRING(20)
    },
    MSSV_Equipment: {
        type: DataTypes.INTEGER
    },
    MSNV_Staff_Equipment: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'EQUIPMENT',
    freezeTableName: true,
    timestamps: false, // Tắt tự động thêm createdAt/updatedAt
    underscored: false // Ánh xạ snake_case sang camelCase
});

module.exports = Equipment;