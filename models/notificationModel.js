const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
    STT: {  // ← Khai báo đúng tên khóa chính
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'STT'  // Ánh xạ đúng tên cột trong DB
    },
    Statistical: {
        type: DataTypes.STRING(100),
        field: 'Statistical'
    },
    Content: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Content',
        validate: {
            notEmpty: {
                msg: 'Nội dung thông báo không được trống'
            }
        }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('system', 'alert', 'reminder'),
        defaultValue: 'system'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    relatedEntity: {
        type: DataTypes.STRING,
        allowNull: true
    },
    relatedEntityId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'NOTIFICATION',
    freezeTableName: true,
    timestamps: false,
    underscored: false
});

module.exports = Notification;