const express = require('express');
const router = express.Router();
const spaceController = require('../controllers/spaceController');
const { protect, adminOnly } = require('../middleware/auth');


// Lấy danh sách tất cả không gian học tập 
router.get('/',protect, spaceController.getAllRooms);

// Lấy thông tin chi tiết một không gian học tập 
router.get('/:noRoom',protect, spaceController.getRoomById);



module.exports = router;