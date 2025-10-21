import { executeMysqlQuery } from "../config/db.js";
import Order from "../models/order.js";

// 🟢 Lấy tất cả đơn hàng (đầy đủ thông tin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await executeMysqlQuery(`
      SELECT 
        o.order_id,
        o.listing_id,
        o.buyer_id,
        o.total_amount,
        o.payment_status,
        o.delivery_status,
        o.created_at,

        u.username AS buyer_name,
        u.full_name AS buyer_fullname,
        u.email AS buyer_email,
        u.phone_number AS buyer_phone,
        u.avatar_url AS buyer_avatar,

        l.title AS listing_title,
        l.price AS listing_price,
        l.province_city AS listing_province,
        l.color AS listing_color,
        l.year_of_manufacture AS listing_year,
        i.image_url AS listing_image

      FROM orders o
      LEFT JOIN users u ON o.buyer_id = u.user_id
      LEFT JOIN listings l ON o.listing_id = l.listing_id
      LEFT JOIN images i ON l.listing_id = i.listing_id AND i.is_primary = TRUE
      ORDER BY o.created_at DESC
    `);

    res.send(orders);
  } catch (error) {
    console.error("❌ Error fetching all orders:", error);
    res.status(500).send({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const id = req.params.id;
    const [order] = await executeMysqlQuery(
      `
      SELECT 
        o.order_id,
        o.listing_id,
        o.buyer_id,
        o.total_amount,
        o.payment_status,
        o.delivery_status,
        o.created_at,

        u.username AS buyer_name,
        u.full_name AS buyer_fullname,
        u.email AS buyer_email,
        u.phone_number AS buyer_phone,
        u.avatar_url AS buyer_avatar,

        l.title AS listing_title,
        l.price AS listing_price,
        l.province_city AS listing_province,
        l.color AS listing_color,
        l.year_of_manufacture AS listing_year,
        (SELECT i.image_url FROM images i 
         WHERE i.listing_id = l.listing_id AND i.is_primary = TRUE 
         LIMIT 1) AS listing_image

      FROM orders o
      LEFT JOIN users u ON o.buyer_id = u.user_id
      LEFT JOIN listings l ON o.listing_id = l.listing_id
      WHERE o.order_id = ?
      `,
      [id]
    );

    if (!order)
      return res.status(404).send({ message: "Không tìm thấy đơn hàng" });

    res.status(200).send(order);
  } catch (error) {
    console.error("❌ Error fetching order by ID:", error);
    res.status(500).send({ message: error.message });
  }
};
// 🟢 Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);

    // Kiểm tra tồn tại của listing và buyer
    const [listing] = await executeMysqlQuery(`SELECT listing_id FROM listings WHERE listing_id = ?`, [order.listing_id]);
    if (!listing) return res.status(400).send({ message: "Listing không tồn tại" });

    const [buyer] = await executeMysqlQuery(`SELECT user_id FROM users WHERE user_id = ?`, [order.buyer_id]);
    if (!buyer) return res.status(400).send({ message: "Người mua không tồn tại" });

    // Tạo đơn hàng
    const result = await executeMysqlQuery(
      `INSERT INTO orders (listing_id, buyer_id, total_amount, payment_status, delivery_status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        order.listing_id,
        order.buyer_id,
        order.total_amount,
        order.payment_status || "pending",
        order.delivery_status || "pending",
      ]
    );

    // Trả lại đơn hàng chi tiết
    const [newOrder] = await executeMysqlQuery(
      `
      SELECT 
        o.*, 
        u.username AS buyer_name, u.email AS buyer_email, u.phone_number AS buyer_phone,
        l.title AS listing_title, l.price AS listing_price, l.province_city AS listing_province,
        i.image_url AS listing_image
      FROM orders o
      LEFT JOIN users u ON o.buyer_id = u.user_id
      LEFT JOIN listings l ON o.listing_id = l.listing_id
      LEFT JOIN images i ON l.listing_id = i.listing_id AND i.is_primary = TRUE
      WHERE o.order_id = ?
      `,
      [result.insertId]
    );

    res.send(newOrder);
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).send({ message: error.message });
  }
};

// 🟢 Cập nhật đơn hàng
export const updateOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const order = new Order(req.body);

    // ✅ Kiểm tra tồn tại listing
    const [listingCheck] = await executeMysqlQuery(
      `SELECT listing_id FROM listings WHERE listing_id = ?`,
      [order.listing_id]
    );
    if (!listingCheck)
      return res.status(400).send({ message: "Listing không tồn tại" });

    // ✅ Kiểm tra tồn tại người mua
    const [buyerCheck] = await executeMysqlQuery(
      `SELECT user_id FROM users WHERE user_id = ?`,
      [order.buyer_id]
    );
    if (!buyerCheck)
      return res.status(400).send({ message: "Người mua không tồn tại" });

    // ✅ Cập nhật đơn hàng
    await executeMysqlQuery(
      `UPDATE orders 
       SET listing_id = ?, buyer_id = ?, total_amount = ?, 
           payment_status = ?, delivery_status = ?
       WHERE order_id = ?`,
      [
        order.listing_id,
        order.buyer_id,
        order.total_amount,
        order.payment_status,
        order.delivery_status,
        id,
      ]
    );

    // ✅ Nếu đơn hàng đã giao và đã thanh toán thì đánh dấu sản phẩm là 'sold'
    if (
      order.delivery_status === "delivered" &&
      order.payment_status === "paid"
    ) {
      await executeMysqlQuery(
        `UPDATE listings 
         SET status = 'sold'
         WHERE listing_id = ?`,
        [order.listing_id]
      );
    }

    // ✅ Lấy dữ liệu đơn hàng sau khi cập nhật
    const [updatedOrder] = await executeMysqlQuery(
      `
      SELECT 
        o.*, 
        u.username AS buyer_name, 
        u.email AS buyer_email, 
        u.phone_number AS buyer_phone,
        l.title AS listing_title, 
        l.price AS listing_price, 
        l.province_city AS listing_province,
        i.image_url AS listing_image
      FROM orders o
      LEFT JOIN users u ON o.buyer_id = u.user_id
      LEFT JOIN listings l ON o.listing_id = l.listing_id
      LEFT JOIN images i ON l.listing_id = i.listing_id AND i.is_primary = TRUE
      WHERE o.order_id = ?
      `,
      [id]
    );

    res.send(updatedOrder);
  } catch (error) {
    console.error("❌ Error updating order:", error);
    res.status(500).send({ message: error.message });
  }
};


// 🟢 Xóa đơn hàng
export const deleteOrder = async (req, res) => {
  try {
    const id = req.params.id;
    await executeMysqlQuery(`DELETE FROM orders WHERE order_id = ?`, [id]);
    res.send({ message: "🗑️ Đã xóa đơn hàng thành công" });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    res.status(500).send({ message: error.message });
  }
};

export const getOrdersByBuyerId = async (req, res) => {
  try {
    const buyerId = req.params.buyerId;
    const orders = await executeMysqlQuery(
      `
      SELECT 
        o.order_id,
        o.listing_id,
        o.buyer_id,
        o.total_amount,
        o.payment_status,
        o.delivery_status,
        o.created_at,

        l.title AS listing_title,
        l.price AS listing_price,
        l.province_city AS listing_province,
        (SELECT i.image_url FROM images i 
         WHERE i.listing_id = l.listing_id AND i.is_primary = TRUE 
         LIMIT 1) AS listing_image

      FROM orders o
      LEFT JOIN listings l ON o.listing_id = l.listing_id
      WHERE o.buyer_id = ?
      ORDER BY o.created_at DESC
      `,
      [buyerId]
    );

    res.status(200).send(orders);
  } catch (error) {
    console.error("❌ Error fetching orders by buyer:", error);
    res.status(500).send({ message: error.message });
  }
};
