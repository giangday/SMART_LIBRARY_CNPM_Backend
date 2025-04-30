const db = require('../config/db');

const User = {
  findAll: async () => {
    try {
      const [rows] = await db.query('SELECT UserID, FullName, Email, PhoneNumber, DateOfBirth, Sex, Active, NoActive FROM USERS');
      return rows;
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  },

  findById: async (userId) => {
    try {
      const [rows] = await db.query(
        'SELECT UserID, FullName, Email, Password, PhoneNumber, DateOfBirth, Sex, Active, NoActive FROM USERS WHERE UserID = ?',
        [userId]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching user by ID: ${error.message}`);
    }
  },

  findByEmail: async (email) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM USERS WHERE Email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching user by email: ${error.message}`);
    }
  },

  create: async (userData) => {
    const {
      FullName, Email, Password, PhoneNumber, DateOfBirth, Sex, role,
      MSSV, MSNV_Admin, MSNV_Staff,
      Department_Class, Date_Start_SignUp, Student_NoRoom, Student_Location, Student_Building,
      Salary
    } = userData;
  
    try {
      // Tìm max UserID hiện tại
      const [maxResult] = await db.query('SELECT MAX(UserID) AS maxId FROM USERS');
      const userId = (maxResult[0].maxId || 0) + 1;
  
      // Lưu người dùng
      await db.query(
        'INSERT INTO USERS (UserID, FullName, Email, Password, PhoneNumber, DateOfBirth, Sex, Active, NoActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, FullName, Email, Password, PhoneNumber, DateOfBirth, Sex, 'T', 'F']
      );
  
      // Thêm vào bảng STUDENT nếu là student
      if (role === 'student' && MSSV) {
        await db.query(
          `INSERT INTO STUDENT (UserID, MSSV, Department_Class, FullName, Date_Start_SignUp, Student_NoRoom, Student_Location, Student_Building)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, MSSV, Department_Class || null, FullName, Date_Start_SignUp || null, Student_NoRoom || null, Student_Location || null, Student_Building || null]
        );
      }
  
      // Thêm vào bảng ADMIN nếu là admin
      else if (role === 'admin' && MSNV_Admin) {
        await db.query(
          `INSERT INTO ADMIN (UserID, MSNV_Admin, Salary)
           VALUES (?, ?, ?)`,
          [userId, MSNV_Admin, Salary || null]
        );
      }
  
      // Thêm vào bảng STAFF nếu là staff
      else if (role === 'staff' && MSNV_Staff) {
        await db.query(
          `INSERT INTO STAFF (UserID, MSNV_Staff, Salary)
           VALUES (?, ?, ?)`,
          [userId, MSNV_Staff, Salary || null]
        );
      }
  
      return {
        UserID: userId, FullName, Email, PhoneNumber, DateOfBirth, Sex,
        Active: 'T', NoActive: 'F'
      };
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  },
  
  

  update: async (userId, updateData) => {
    const { FullName, Email, Password, PhoneNumber, DateOfBirth, Sex } = updateData;
    try {
      const updateFields = {};
      if (FullName) updateFields.FullName = FullName;
      if (Email) updateFields.Email = Email;
      if (PhoneNumber) updateFields.PhoneNumber = PhoneNumber;
      if (DateOfBirth) updateFields.DateOfBirth = DateOfBirth;
      if (Sex) updateFields.Sex = Sex;

      // Nếu mật khẩu được thay đổi, thì lưu mật khẩu thô mới
      if (Password) {
        updateFields.Password = Password;
      }

      if (Object.keys(updateFields).length === 0) {
        return null;
      }

      const setClause = Object.keys(updateFields)
        .map((key) => `${key} = ?`)
        .join(', ');
      const values = Object.values(updateFields);

      await db.query(
        `UPDATE USERS SET ${setClause} WHERE UserID = ?`,
        [...values, userId]
      );

      return await User.findById(userId);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  },

  delete: async (userId) => {
    try {
      // Xác định vai trò của người dùng
      const role = await User.getRole(userId);
  
      // Xóa dữ liệu trong bảng role tương ứng
      if (role === 'student') {
        await db.query('DELETE FROM STUDENT WHERE UserID = ?', [userId]);
      } else if (role === 'admin') {
        await db.query('DELETE FROM ADMIN WHERE UserID = ?', [userId]);
      } else if (role === 'staff') {
        await db.query('DELETE FROM STAFF WHERE UserID = ?', [userId]);
      }
  
      // Xóa người dùng trong bảng USERS
      await db.query('DELETE FROM USERS WHERE UserID = ?', [userId]);
  
      return true;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  },

  comparePassword: async (candidatePassword, storedPassword) => {
    try {
      // So sánh mật khẩu thô
      return candidatePassword === storedPassword;
    } catch (error) {
      throw new Error(`Password comparison error: ${error.message}`);
    }
  },

  getRole: async (userId) => {
    try {
      const [student] = await db.query('SELECT * FROM STUDENT WHERE UserID = ?', [userId]);
      if (student.length > 0) return 'student';

      const [admin] = await db.query('SELECT * FROM ADMIN WHERE UserID = ?', [userId]);
      if (admin.length > 0) return 'admin';

      const [staff] = await db.query('SELECT * FROM STAFF WHERE UserID = ?', [userId]);
      if (staff.length > 0) return 'staff';

      return 'user';
    } catch (error) {
      throw new Error(`Error checking role: ${error.message}`);
    }
  },

  saveResetPasswordToken: async (userId, token, expires) => {
    try {
      await db.query(
        'UPDATE USERS SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE UserID = ?',
        [token, expires, userId]
      );
    } catch (error) {
      throw new Error(`Error saving reset password token: ${error.message}`);
    }
  },

  findByResetPasswordToken: async (token) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM USERS WHERE resetPasswordToken = ? AND resetPasswordExpires > NOW()',
        [token]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by reset token: ${error.message}`);
    }
  },
};

module.exports = { User };
