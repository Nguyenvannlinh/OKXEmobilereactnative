import jwt from 'jsonwebtoken';
import { executeMysqlQuery } from '../config/db.js';

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token không tồn tại'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const userSql = `
            SELECT u.*, r.role_name 
            FROM users u 
            LEFT JOIN user_roles ur ON u.user_id = ur.user_id 
            LEFT JOIN roles r ON ur.role_id = r.role_id 
            WHERE u.user_id = ?
        `;
        const users = await executeMysqlQuery(userSql, [decoded.userId]);
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token không hợp lệ'
        });
    }
};

const adminMiddleware = async (req, res, next) => {
    try {
        if (req.user.role_name !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Yêu cầu quyền quản trị viên'
            });
        }
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

export { adminMiddleware, authMiddleware };

