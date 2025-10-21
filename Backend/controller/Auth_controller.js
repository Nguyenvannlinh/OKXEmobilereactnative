import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeMysqlQuery } from '../config/db.js';
import User from '../models/user.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usersData = await executeMysqlQuery(
      `
      SELECT u.*, GROUP_CONCAT(r.role_name) as roles 
      FROM users u 
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id 
      LEFT JOIN roles r ON ur.role_id = r.role_id 
      WHERE u.email = ? 
      GROUP BY u.user_id
      `,
      [email]
    );

    if (usersData.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    const userData = usersData[0];
    const user = new User({
      ...userData,
      roles: userData.roles ? userData.roles.split(',') : [],
    });

    // ✅ Kiểm tra mật khẩu (hash hoặc plaintext)
    let isValidPassword = false;

    if (user.password_hash) {
      if (user.password_hash.startsWith('$2b$')) {
        // 🔹 Trường hợp mật khẩu mã hóa bằng bcrypt
        isValidPassword = await bcrypt.compare(password, user.password_hash);
      } else {
        // 🔹 Trường hợp mật khẩu lưu dạng plaintext (ít gặp)
        isValidPassword = password === user.password_hash;
      }
    }

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    // ✅ Tạo JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        roles: user.roles,
      },
      process.env.JWT_SECRET || 'my_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // ✅ Trả về dữ liệu người dùng
    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone_number: user.phone_number,
        avatar_url: user.avatar_url,
        roles: user.roles,
        is_verified: user.is_verified,
      },
    });
  } catch (error) {
    console.error('❌ Lỗi trong quá trình đăng nhập:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message,
    });
  }
};
