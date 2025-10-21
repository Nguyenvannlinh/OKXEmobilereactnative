import { executeMysqlQuery } from '../config/database.js';

class CategoryController {
    
    // ==================== BODY TYPES ====================
    
    async getBodyTypes(req, res) {
        try {
            const sql = 'SELECT * FROM body_types ORDER BY name';
            const bodyTypes = await executeMysqlQuery(sql);
            
            res.json({
                success: true,
                data: bodyTypes
            });
        } catch (error) {
            console.error('Get body types error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async getBodyTypeById(req, res) {
        try {
            const bodyTypeId = req.params.id;
            const sql = 'SELECT * FROM body_types WHERE body_type_id = ?';
            const bodyTypes = await executeMysqlQuery(sql, [bodyTypeId]);
            
            if (bodyTypes.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy kiểu dáng'
                });
            }

            res.json({
                success: true,
                data: bodyTypes[0]
            });
        } catch (error) {
            console.error('Get body type error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async createBodyType(req, res) {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên kiểu dáng là bắt buộc'
                });
            }

            // Check if body type already exists
            const checkSql = 'SELECT body_type_id FROM body_types WHERE name = ?';
            const existing = await executeMysqlQuery(checkSql, [name]);
            
            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Kiểu dáng đã tồn tại'
                });
            }

            const insertSql = 'INSERT INTO body_types (name) VALUES (?)';
            const result = await executeMysqlQuery(insertSql, [name]);

            res.status(201).json({
                success: true,
                message: 'Tạo kiểu dáng thành công',
                data: {
                    body_type_id: result.insertId,
                    name
                }
            });

        } catch (error) {
            console.error('Create body type error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async updateBodyType(req, res) {
        try {
            const bodyTypeId = req.params.id;
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên kiểu dáng là bắt buộc'
                });
            }

            // Check if body type exists
            const checkSql = 'SELECT body_type_id FROM body_types WHERE body_type_id = ?';
            const existing = await executeMysqlQuery(checkSql, [bodyTypeId]);
            
            if (existing.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy kiểu dáng'
                });
            }

            // Check if name already exists (excluding current one)
            const nameCheckSql = 'SELECT body_type_id FROM body_types WHERE name = ? AND body_type_id != ?';
            const nameExists = await executeMysqlQuery(nameCheckSql, [name, bodyTypeId]);
            
            if (nameExists.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên kiểu dáng đã tồn tại'
                });
            }

            const updateSql = 'UPDATE body_types SET name = ? WHERE body_type_id = ?';
            await executeMysqlQuery(updateSql, [name, bodyTypeId]);

            res.json({
                success: true,
                message: 'Cập nhật kiểu dáng thành công',
                data: {
                    body_type_id: parseInt(bodyTypeId),
                    name
                }
            });

        } catch (error) {
            console.error('Update body type error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async deleteBodyType(req, res) {
        try {
            const bodyTypeId = req.params.id;

            // Check if body type exists
            const checkSql = 'SELECT body_type_id FROM body_types WHERE body_type_id = ?';
            const existing = await executeMysqlQuery(checkSql, [bodyTypeId]);
            
            if (existing.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy kiểu dáng'
                });
            }

            // Check if body type is being used in listings
            const usageSql = 'SELECT listing_id FROM listings WHERE body_type_id = ? LIMIT 1';
            const usage = await executeMysqlQuery(usageSql, [bodyTypeId]);
            
            if (usage.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa kiểu dáng vì đang được sử dụng trong tin đăng'
                });
            }

            const deleteSql = 'DELETE FROM body_types WHERE body_type_id = ?';
            await executeMysqlQuery(deleteSql, [bodyTypeId]);

            res.json({
                success: true,
                message: 'Xóa kiểu dáng thành công'
            });

        } catch (error) {
            console.error('Delete body type error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async getBodyTypeStats(req, res) {
        try {
            const bodyTypeId = req.params.id;

            const statsSql = `
                SELECT 
                    bt.name as body_type_name,
                    COUNT(l.listing_id) as total_listings,
                    COUNT(CASE WHEN l.status = 'approved' THEN 1 END) as active_listings,
                    COUNT(CASE WHEN l.status = 'sold' THEN 1 END) as sold_listings,
                    AVG(l.price) as average_price,
                    MIN(l.price) as min_price,
                    MAX(l.price) as max_price
                FROM body_types bt
                LEFT JOIN listings l ON bt.body_type_id = l.body_type_id
                WHERE bt.body_type_id = ?
                GROUP BY bt.body_type_id, bt.name
            `;

            const stats = await executeMysqlQuery(statsSql, [bodyTypeId]);

            if (stats.length === 0) {
                // Get body type name even if no listings
                const bodyTypeSql = 'SELECT name FROM body_types WHERE body_type_id = ?';
                const bodyType = await executeMysqlQuery(bodyTypeSql, [bodyTypeId]);
                
                if (bodyType.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Không tìm thấy kiểu dáng'
                    });
                }

                stats[0] = {
                    body_type_name: bodyType[0].name,
                    total_listings: 0,
                    active_listings: 0,
                    sold_listings: 0,
                    average_price: 0,
                    min_price: 0,
                    max_price: 0
                };
            }

            res.json({
                success: true,
                data: stats[0]
            });

        } catch (error) {
            console.error('Get body type stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // ==================== MANUFACTURERS ====================

    async getManufacturers(req, res) {
        try {
            const sql = `
                SELECT m.*, 
                       COUNT(l.listing_id) as total_listings,
                       COUNT(CASE WHEN l.status = 'approved' THEN 1 END) as active_listings
                FROM manufacturers m
                LEFT JOIN listings l ON m.manufacturer_id = l.manufacturer_id
                GROUP BY m.manufacturer_id, m.name, m.logo_url
                ORDER BY m.name
            `;
            const manufacturers = await executeMysqlQuery(sql);
            
            res.json({
                success: true,
                data: manufacturers
            });
        } catch (error) {
            console.error('Get manufacturers error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async getManufacturerById(req, res) {
        try {
            const manufacturerId = req.params.id;
            const sql = 'SELECT * FROM manufacturers WHERE manufacturer_id = ?';
            const manufacturers = await executeMysqlQuery(sql, [manufacturerId]);
            
            if (manufacturers.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy hãng xe'
                });
            }

            res.json({
                success: true,
                data: manufacturers[0]
            });
        } catch (error) {
            console.error('Get manufacturer error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async createManufacturer(req, res) {
        try {
            const { name, logo_url } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên hãng xe là bắt buộc'
                });
            }

            // Check if manufacturer already exists
            const checkSql = 'SELECT manufacturer_id FROM manufacturers WHERE name = ?';
            const existing = await executeMysqlQuery(checkSql, [name]);
            
            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Hãng xe đã tồn tại'
                });
            }

            const insertSql = 'INSERT INTO manufacturers (name, logo_url) VALUES (?, ?)';
            const result = await executeMysqlQuery(insertSql, [name, logo_url || null]);

            res.status(201).json({
                success: true,
                message: 'Tạo hãng xe thành công',
                data: {
                    manufacturer_id: result.insertId,
                    name,
                    logo_url
                }
            });

        } catch (error) {
            console.error('Create manufacturer error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // ==================== MODELS ====================

    async getModels(req, res) {
        try {
            const manufacturerId = req.query.manufacturer_id;
            let sql = `
                SELECT m.*, man.name as manufacturer_name, man.logo_url as manufacturer_logo,
                       COUNT(list.listing_id) as total_listings
                FROM models m
                LEFT JOIN manufacturers man ON m.manufacturer_id = man.manufacturer_id
                LEFT JOIN listings list ON m.model_id = list.model_id
            `;
            let params = [];

            if (manufacturerId) {
                sql += ' WHERE m.manufacturer_id = ?';
                params.push(manufacturerId);
            }

            sql += ' GROUP BY m.model_id, m.name, m.manufacturer_id, m.year_introduced ORDER BY man.name, m.name';
            
            const models = await executeMysqlQuery(sql, params);
            
            res.json({
                success: true,
                data: models
            });
        } catch (error) {
            console.error('Get models error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async getModelsByManufacturer(req, res) {
        try {
            const manufacturerId = req.params.manufacturerId;
            
            const sql = `
                SELECT m.*, COUNT(l.listing_id) as total_listings
                FROM models m
                LEFT JOIN listings l ON m.model_id = l.model_id
                WHERE m.manufacturer_id = ?
                GROUP BY m.model_id, m.name, m.year_introduced
                ORDER BY m.name
            `;
            
            const models = await executeMysqlQuery(sql, [manufacturerId]);
            
            res.json({
                success: true,
                data: models
            });
        } catch (error) {
            console.error('Get models by manufacturer error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async createModel(req, res) {
        try {
            const { manufacturer_id, name, year_introduced } = req.body;

            if (!manufacturer_id || !name) {
                return res.status(400).json({
                    success: false,
                    message: 'Manufacturer ID và tên model là bắt buộc'
                });
            }

            // Check if manufacturer exists
            const manuCheck = await executeMysqlQuery(
                'SELECT manufacturer_id FROM manufacturers WHERE manufacturer_id = ?', 
                [manufacturer_id]
            );
            
            if (manuCheck.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Hãng xe không tồn tại'
                });
            }

            // Check if model already exists for this manufacturer
            const checkSql = 'SELECT model_id FROM models WHERE manufacturer_id = ? AND name = ?';
            const existing = await executeMysqlQuery(checkSql, [manufacturer_id, name]);
            
            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Model đã tồn tại cho hãng xe này'
                });
            }

            const insertSql = 'INSERT INTO models (manufacturer_id, name, year_introduced) VALUES (?, ?, ?)';
            const result = await executeMysqlQuery(insertSql, [
                manufacturer_id, 
                name, 
                year_introduced || null
            ]);

            res.status(201).json({
                success: true,
                message: 'Tạo model thành công',
                data: {
                    model_id: result.insertId,
                    manufacturer_id,
                    name,
                    year_introduced
                }
            });

        } catch (error) {
            console.error('Create model error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // ==================== FUEL TYPES ====================

    async getFuelTypes(req, res) {
        try {
            const sql = `
                SELECT ft.*, COUNT(l.listing_id) as total_listings
                FROM fuel_types ft
                LEFT JOIN listings l ON ft.fuel_type_id = l.fuel_type_id
                GROUP BY ft.fuel_type_id, ft.name
                ORDER BY ft.name
            `;
            const fuelTypes = await executeMysqlQuery(sql);
            
            res.json({
                success: true,
                data: fuelTypes
            });
        } catch (error) {
            console.error('Get fuel types error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async createFuelType(req, res) {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên loại nhiên liệu là bắt buộc'
                });
            }

            const checkSql = 'SELECT fuel_type_id FROM fuel_types WHERE name = ?';
            const existing = await executeMysqlQuery(checkSql, [name]);
            
            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Loại nhiên liệu đã tồn tại'
                });
            }

            const insertSql = 'INSERT INTO fuel_types (name) VALUES (?)';
            const result = await executeMysqlQuery(insertSql, [name]);

            res.status(201).json({
                success: true,
                message: 'Tạo loại nhiên liệu thành công',
                data: {
                    fuel_type_id: result.insertId,
                    name
                }
            });

        } catch (error) {
            console.error('Create fuel type error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // ==================== TRANSMISSIONS ====================

    async getTransmissions(req, res) {
        try {
            const sql = `
                SELECT t.*, COUNT(l.listing_id) as total_listings
                FROM transmissions t
                LEFT JOIN listings l ON t.transmission_id = l.transmission_id
                GROUP BY t.transmission_id, t.name
                ORDER BY t.name
            `;
            const transmissions = await executeMysqlQuery(sql);
            
            res.json({
                success: true,
                data: transmissions
            });
        } catch (error) {
            console.error('Get transmissions error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async createTransmission(req, res) {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên hộp số là bắt buộc'
                });
            }

            const checkSql = 'SELECT transmission_id FROM transmissions WHERE name = ?';
            const existing = await executeMysqlQuery(checkSql, [name]);
            
            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Hộp số đã tồn tại'
                });
            }

            const insertSql = 'INSERT INTO transmissions (name) VALUES (?)';
            const result = await executeMysqlQuery(insertSql, [name]);

            res.status(201).json({
                success: true,
                message: 'Tạo hộp số thành công',
                data: {
                    transmission_id: result.insertId,
                    name
                }
            });

        } catch (error) {
            console.error('Create transmission error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // ==================== FEATURES ====================

    async getFeatures(req, res) {
        try {
            const sql = `
                SELECT f.*, COUNT(lf.listing_id) as usage_count
                FROM features f
                LEFT JOIN listing_features lf ON f.feature_id = lf.feature_id
                GROUP BY f.feature_id, f.name
                ORDER BY f.name
            `;
            const features = await executeMysqlQuery(sql);
            
            res.json({
                success: true,
                data: features
            });
        } catch (error) {
            console.error('Get features error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async createFeature(req, res) {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên tính năng là bắt buộc'
                });
            }

            const checkSql = 'SELECT feature_id FROM features WHERE name = ?';
            const existing = await executeMysqlQuery(checkSql, [name]);
            
            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Tính năng đã tồn tại'
                });
            }

            const insertSql = 'INSERT INTO features (name) VALUES (?)';
            const result = await executeMysqlQuery(insertSql, [name]);

            res.status(201).json({
                success: true,
                message: 'Tạo tính năng thành công',
                data: {
                    feature_id: result.insertId,
                    name
                }
            });

        } catch (error) {
            console.error('Create feature error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // ==================== PROVINCES ====================

    async getProvinces(req, res) {
        try {
            const sql = `
                SELECT p.*, COUNT(l.listing_id) as total_listings
                FROM provinces p
                LEFT JOIN listings l ON p.name = l.province_city
                GROUP BY p.province_id, p.name
                ORDER BY p.name
            `;
            const provinces = await executeMysqlQuery(sql);
            
            res.json({
                success: true,
                data: provinces
            });
        } catch (error) {
            console.error('Get provinces error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    async createProvince(req, res) {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên tỉnh/thành phố là bắt buộc'
                });
            }

            const checkSql = 'SELECT province_id FROM provinces WHERE name = ?';
            const existing = await executeMysqlQuery(checkSql, [name]);
            
            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Tỉnh/thành phố đã tồn tại'
                });
            }

            const insertSql = 'INSERT INTO provinces (name) VALUES (?)';
            const result = await executeMysqlQuery(insertSql, [name]);

            res.status(201).json({
                success: true,
                message: 'Tạo tỉnh/thành phố thành công',
                data: {
                    province_id: result.insertId,
                    name
                }
            });

        } catch (error) {
            console.error('Create province error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // ==================== CATEGORY STATS ====================

    async getCategoryStats(req, res) {
        try {
            const statsSql = `
                SELECT 
                    (SELECT COUNT(*) FROM body_types) as total_body_types,
                    (SELECT COUNT(*) FROM manufacturers) as total_manufacturers,
                    (SELECT COUNT(*) FROM models) as total_models,
                    (SELECT COUNT(*) FROM fuel_types) as total_fuel_types,
                    (SELECT COUNT(*) FROM transmissions) as total_transmissions,
                    (SELECT COUNT(*) FROM features) as total_features,
                    (SELECT COUNT(*) FROM provinces) as total_provinces,
                    
                    (SELECT COUNT(*) FROM listings WHERE body_type_id IS NOT NULL) as listings_with_body_type,
                    (SELECT COUNT(*) FROM listings WHERE fuel_type_id IS NOT NULL) as listings_with_fuel_type,
                    (SELECT COUNT(*) FROM listings WHERE transmission_id IS NOT NULL) as listings_with_transmission
            `;

            const stats = await executeMysqlQuery(statsSql);

            // Top body types
            const topBodyTypesSql = `
                SELECT bt.name, COUNT(l.listing_id) as listing_count
                FROM body_types bt
                LEFT JOIN listings l ON bt.body_type_id = l.body_type_id
                GROUP BY bt.body_type_id, bt.name
                ORDER BY listing_count DESC
                LIMIT 5
            `;

            // Top manufacturers
            const topManufacturersSql = `
                SELECT m.name, COUNT(l.listing_id) as listing_count
                FROM manufacturers m
                LEFT JOIN listings l ON m.manufacturer_id = l.manufacturer_id
                GROUP BY m.manufacturer_id, m.name
                ORDER BY listing_count DESC
                LIMIT 5
            `;

            const [topBodyTypes, topManufacturers] = await Promise.all([
                executeMysqlQuery(topBodyTypesSql),
                executeMysqlQuery(topManufacturersSql)
            ]);

            res.json({
                success: true,
                data: {
                    totals: stats[0],
                    top_body_types: topBodyTypes,
                    top_manufacturers: topManufacturers
                }
            });

        } catch (error) {
            console.error('Get category stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }
}

export default new CategoryController();