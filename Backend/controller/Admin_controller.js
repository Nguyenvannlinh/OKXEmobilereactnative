import { executeMysqlQuery } from '../config/database.js';

class AdminController {
    async getDashboardStats(req, res) {
        try {
            const statsSql = `
                SELECT 
                    -- User stats
                    (SELECT COUNT(*) FROM users) as total_users,
                    (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) as new_users_today,
                    (SELECT COUNT(*) FROM users WHERE is_verified = 1) as verified_users,
                    
                    -- Listing stats
                    (SELECT COUNT(*) FROM listings) as total_listings,
                    (SELECT COUNT(*) FROM listings WHERE status = 'pending') as pending_listings,
                    (SELECT COUNT(*) FROM listings WHERE status = 'approved') as approved_listings,
                    (SELECT COUNT(*) FROM listings WHERE status = 'sold') as sold_listings,
                    (SELECT COUNT(*) FROM listings WHERE DATE(created_at) = CURDATE()) as new_listings_today,
                    
                    -- Dealer stats
                    (SELECT COUNT(*) FROM dealers) as total_dealers,
                    (SELECT COUNT(*) FROM dealers WHERE is_verified = 1) as verified_dealers,
                    (SELECT COUNT(*) FROM dealers WHERE is_verified = 0) as pending_dealers,
                    
                    -- Message stats
                    (SELECT COUNT(*) FROM messages WHERE DATE(sent_at) = CURDATE()) as messages_today,
                    
                    -- Financial stats (giả sử có commission)
                    (SELECT SUM(price) FROM listings WHERE status = 'sold' AND YEAR(updated_at) = YEAR(CURDATE())) as total_sales
            `;
            
            const statsResult = await executeMysqlQuery(statsSql);
            const stats = statsResult[0];

            // Recent activities
            const recentActivitiesSql = `
                (SELECT 'listing' as type, listing_id as id, title as name, created_at, user_id 
                 FROM listings ORDER BY created_at DESC LIMIT 5)
                UNION ALL
                (SELECT 'user' as type, user_id as id, username as name, created_at, user_id 
                 FROM users ORDER BY created_at DESC LIMIT 5)
                UNION ALL
                (SELECT 'dealer' as type, dealer_id as id, dealer_name as name, created_at, user_id 
                 FROM dealers ORDER BY created_at DESC LIMIT 5)
                ORDER BY created_at DESC LIMIT 10
            `;
            
            const recentActivities = await executeMysqlQuery(recentActivitiesSql);

            // Monthly sales data
            const monthlySalesSql = `
                SELECT 
                    YEAR(updated_at) as year,
                    MONTH(updated_at) as month,
                    COUNT(*) as sold_count,
                    SUM(price) as total_amount
                FROM listings 
                WHERE status = 'sold' AND updated_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY YEAR(updated_at), MONTH(updated_at)
                ORDER BY year DESC, month DESC
                LIMIT 12
            `;
            
            const monthlySales = await executeMysqlQuery(monthlySalesSql);

            res.json({
                success: true,
                data: {
                    stats,
                    recent_activities: recentActivities,
                    monthly_sales: monthlySales
                }
            });

        } catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async manageListings(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const status = req.query.status; // pending, approved, rejected, sold, hidden
            const search = req.query.search;

            let whereConditions = ['1=1'];
            let params = [];

            if (status) {
                whereConditions.push('l.status = ?');
                params.push(status);
            }

            if (search) {
                whereConditions.push('(l.title LIKE ? OR u.username LIKE ? OR u.full_name LIKE ?)');
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

            const countSql = `SELECT COUNT(*) as total FROM listings l LEFT JOIN users u ON l.user_id = u.user_id ${whereClause}`;
            const countResult = await executeMysqlQuery(countSql, params);
            const total = countResult[0].total;

            const listingsSql = `
                SELECT 
                    l.*,
                    u.username,
                    u.full_name as user_full_name,
                    u.email as user_email,
                    u.phone_number as user_phone,
                    m.name as manufacturer_name,
                    mo.name as model_name,
                    (SELECT COUNT(*) FROM images i WHERE i.listing_id = l.listing_id) as image_count,
                    (SELECT COUNT(*) FROM messages m WHERE m.listing_id = l.listing_id) as message_count
                FROM listings l
                LEFT JOIN users u ON l.user_id = u.user_id
                LEFT JOIN manufacturers m ON l.manufacturer_id = m.manufacturer_id
                LEFT JOIN models mo ON l.model_id = mo.model_id
                ${whereClause}
                ORDER BY l.created_at DESC
                LIMIT ? OFFSET ?
            `;

            const listings = await executeMysqlQuery(listingsSql, [...params, limit, offset]);

            res.json({
                success: true,
                data: listings,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.error('Manage listings error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async approveListing(req, res) {
        const connection = await executeMysqlQuery.getConnection().promise();
        
        try {
            await connection.beginTransaction();

            const listingId = req.params.id;
            const adminId = req.user.user_id;

            // Check if listing exists
            const checkSql = 'SELECT * FROM listings WHERE listing_id = ?';
            const listings = await connection.execute(checkSql, [listingId]);

            if (listings[0].length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy tin đăng'
                });
            }

            const listing = listings[0][0];

            if (listing.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Tin đăng không ở trạng thái chờ duyệt'
                });
            }

            // Approve listing
            const updateSql = `
                UPDATE listings 
                SET status = 'approved', approved_at = CURRENT_TIMESTAMP, approved_by = ? 
                WHERE listing_id = ?
            `;
            await connection.execute(updateSql, [adminId, listingId]);

            // Log admin action
            const logSql = `
                INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, description) 
                VALUES (?, 'approve', 'listing', ?, 'Approved listing: ${listing.title}')
            `;
            await connection.execute(logSql, [adminId, listingId]);

            await connection.commit();

            const updatedListing = await this.getListingWithDetails(listingId);

            res.json({
                success: true,
                message: 'Đã duyệt tin đăng thành công',
                data: updatedListing
            });

        } catch (error) {
            await connection.rollback();
            console.error('Approve listing error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }

    async rejectListing(req, res) {
        const connection = await executeMysqlQuery.getConnection().promise();
        
        try {
            await connection.beginTransaction();

            const listingId = req.params.id;
            const adminId = req.user.user_id;
            const { reason } = req.body;

            if (!reason) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng cung cấp lý do từ chối'
                });
            }

            // Check if listing exists
            const checkSql = 'SELECT * FROM listings WHERE listing_id = ?';
            const listings = await connection.execute(checkSql, [listingId]);

            if (listings[0].length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy tin đăng'
                });
            }

            const listing = listings[0][0];

            // Reject listing
            const updateSql = `
                UPDATE listings 
                SET status = 'rejected', rejected_at = CURRENT_TIMESTAMP, rejected_by = ?, rejection_reason = ? 
                WHERE listing_id = ?
            `;
            await connection.execute(updateSql, [adminId, reason, listingId]);

            // Log admin action
            const logSql = `
                INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, description) 
                VALUES (?, 'reject', 'listing', ?, 'Rejected listing: ${listing.title}. Reason: ${reason}')
            `;
            await connection.execute(logSql, [adminId, listingId]);

            await connection.commit();

            res.json({
                success: true,
                message: 'Đã từ chối tin đăng'
            });

        } catch (error) {
            await connection.rollback();
            console.error('Reject listing error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }

    async manageUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const search = req.query.search;
            const role = req.query.role;
            const is_verified = req.query.is_verified;

            let whereConditions = ['1=1'];
            let params = [];

            if (search) {
                whereConditions.push('(u.username LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?)');
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            if (role) {
                whereConditions.push('r.role_name = ?');
                params.push(role);
            }

            if (is_verified !== undefined) {
                whereConditions.push('u.is_verified = ?');
                params.push(is_verified === 'true' ? 1 : 0);
            }

            const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

            const countSql = `
                SELECT COUNT(*) as total 
                FROM users u 
                LEFT JOIN user_roles ur ON u.user_id = ur.user_id 
                LEFT JOIN roles r ON ur.role_id = r.role_id 
                ${whereClause}
            `;
            const countResult = await executeMysqlQuery(countSql, params);
            const total = countResult[0].total;

            const usersSql = `
                SELECT 
                    u.*,
                    r.role_name,
                    r.role_id,
                    (SELECT COUNT(*) FROM listings l WHERE l.user_id = u.user_id) as listing_count,
                    (SELECT COUNT(*) FROM dealers d WHERE d.user_id = u.user_id) as dealer_count,
                    (SELECT COUNT(*) FROM messages m WHERE m.sender_id = u.user_id OR m.receiver_id = u.user_id) as message_count
                FROM users u 
                LEFT JOIN user_roles ur ON u.user_id = ur.user_id 
                LEFT JOIN roles r ON ur.role_id = r.role_id 
                ${whereClause}
                ORDER BY u.created_at DESC
                LIMIT ? OFFSET ?
            `;

            const users = await executeMysqlQuery(usersSql, [...params, limit, offset]);

            res.json({
                success: true,
                data: users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.error('Manage users error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async updateUserRole(req, res) {
        try {
            const userId = req.params.id;
            const { role_id } = req.body;

            if (!role_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu role_id'
                });
            }

            // Check if user exists
            const userCheck = await executeMysqlQuery('SELECT user_id FROM users WHERE user_id = ?', [userId]);
            if (userCheck.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User không tồn tại'
                });
            }

            // Check if role exists
            const roleCheck = await executeMysqlQuery('SELECT role_id FROM roles WHERE role_id = ?', [role_id]);
            if (roleCheck.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Role không tồn tại'
                });
            }

            // Update user role
            await executeMysqlQuery(
                'UPDATE user_roles SET role_id = ? WHERE user_id = ?',
                [role_id, userId]
            );

            res.json({
                success: true,
                message: 'Cập nhật role thành công'
            });

        } catch (error) {
            console.error('Update user role error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async verifyUser(req, res) {
        try {
            const userId = req.params.id;

            await executeMysqlQuery(
                'UPDATE users SET is_verified = 1 WHERE user_id = ?',
                [userId]
            );

            res.json({
                success: true,
                message: 'Đã xác thực user thành công'
            });

        } catch (error) {
            console.error('Verify user error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async blockUser(req, res) {
        try {
            const userId = req.params.id;
            const { reason } = req.body;

            await executeMysqlQuery(
                'UPDATE users SET is_blocked = 1, block_reason = ?, blocked_at = CURRENT_TIMESTAMP WHERE user_id = ?',
                [reason || 'Vi phạm điều khoản', userId]
            );

            res.json({
                success: true,
                message: 'Đã khóa user thành công'
            });

        } catch (error) {
            console.error('Block user error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async unblockUser(req, res) {
        try {
            const userId = req.params.id;

            await executeMysqlQuery(
                'UPDATE users SET is_blocked = 0, block_reason = NULL, blocked_at = NULL WHERE user_id = ?',
                [userId]
            );

            res.json({
                success: true,
                message: 'Đã mở khóa user thành công'
            });

        } catch (error) {
            console.error('Unblock user error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async manageDealers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const is_verified = req.query.is_verified;
            const search = req.query.search;

            let whereConditions = ['1=1'];
            let params = [];

            if (is_verified !== undefined) {
                whereConditions.push('d.is_verified = ?');
                params.push(is_verified === 'true' ? 1 : 0);
            }

            if (search) {
                whereConditions.push('(d.dealer_name LIKE ? OR u.username LIKE ? OR u.full_name LIKE ?)');
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

            const countSql = `SELECT COUNT(*) as total FROM dealers d LEFT JOIN users u ON d.user_id = u.user_id ${whereClause}`;
            const countResult = await executeMysqlQuery(countSql, params);
            const total = countResult[0].total;

            const dealersSql = `
                SELECT 
                    d.*,
                    u.username,
                    u.email,
                    u.phone_number,
                    u.full_name as user_full_name,
                    u.avatar_url as user_avatar,
                    u.created_at as user_joined_date,
                    (SELECT COUNT(*) FROM listings l WHERE l.user_id = d.user_id AND l.status = 'approved') as active_listings,
                    (SELECT COUNT(*) FROM listings l WHERE l.user_id = d.user_id AND l.status = 'sold') as sold_listings
                FROM dealers d
                LEFT JOIN users u ON d.user_id = u.user_id
                ${whereClause}
                ORDER BY d.created_at DESC
                LIMIT ? OFFSET ?
            `;

            const dealers = await executeMysqlQuery(dealersSql, [...params, limit, offset]);

            res.json({
                success: true,
                data: dealers,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.error('Manage dealers error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async verifyDealer(req, res) {
        try {
            const dealerId = req.params.id;
            const adminId = req.user.user_id;

            // Verify dealer
            await executeMysqlQuery(
                'UPDATE dealers SET is_verified = 1, verified_at = CURRENT_TIMESTAMP, verified_by = ? WHERE dealer_id = ?',
                [adminId, dealerId]
            );

            // Get dealer user_id to update role
            const dealerSql = 'SELECT user_id FROM dealers WHERE dealer_id = ?';
            const dealers = await executeMysqlQuery(dealerSql, [dealerId]);
            
            if (dealers.length > 0) {
                // Update user role to dealer (giả sử role_id 3 là dealer)
                await executeMysqlQuery(
                    'UPDATE user_roles SET role_id = 3 WHERE user_id = ?',
                    [dealers[0].user_id]
                );
            }

            res.json({
                success: true,
                message: 'Đã xác thực đại lý thành công'
            });

        } catch (error) {
            console.error('Verify dealer error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // Helper method
    async getListingWithDetails(listingId) {
        const sql = `
            SELECT 
                l.*,
                u.username,
                u.full_name as user_full_name,
                m.name as manufacturer_name,
                mo.name as model_name
            FROM listings l
            LEFT JOIN users u ON l.user_id = u.user_id
            LEFT JOIN manufacturers m ON l.manufacturer_id = m.manufacturer_id
            LEFT JOIN models mo ON l.model_id = mo.model_id
            WHERE l.listing_id = ?
        `;
        
        const result = await executeMysqlQuery(sql, [listingId]);
        return result.length > 0 ? result[0] : null;
    }
}

export default new AdminController();