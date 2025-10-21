import { executeMysqlQuery } from "../config/db.js";
import Payment from "../models/Payment.js";

// Lấy tất cả thanh toán
export const getAllPayments = async (req, res) => {
  try {
    const payments = await executeMysqlQuery(`
      SELECT p.*, o.total_amount, o.buyer_id, u.username AS buyer_name
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.order_id
      LEFT JOIN users u ON o.buyer_id = u.user_id
      ORDER BY p.created_at DESC
    `);
    res.send(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).send(error.message);
  }
};

// Lấy thanh toán theo ID
export const getPaymentById = async (req, res) => {
  try {
    const id = req.params.id;
    const payment = await executeMysqlQuery(`
      SELECT p.*, o.total_amount, u.username AS buyer_name
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.order_id
      LEFT JOIN users u ON o.buyer_id = u.user_id
      WHERE p.payment_id = ?
    `, [id]);
    res.send(payment[0] || {});
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).send(error.message);
  }
};

// Tạo thanh toán mới
export const createPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await executeMysqlQuery(
      `INSERT INTO payments (order_id, payment_method, payment_status, transaction_code, amount)
       VALUES (?, ?, ?, ?, ?)`,
      [
        payment.order_id,
        payment.payment_method,
        payment.payment_status || "pending",
        payment.transaction_code,
        payment.amount
      ]
    );
    res.send(payment);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).send(error.message);
  }
};

// Cập nhật thanh toán
export const updatePayment = async (req, res) => {
  try {
    const id = req.params.id;
    const payment = new Payment(req.body);
    await executeMysqlQuery(
      `UPDATE payments 
       SET order_id = ?, payment_method = ?, payment_status = ?, transaction_code = ?, amount = ?
       WHERE payment_id = ?`,
      [
        payment.order_id,
        payment.payment_method,
        payment.payment_status,
        payment.transaction_code,
        payment.amount,
        id
      ]
    );
    res.send(payment);
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).send(error.message);
  }
};

// Xóa thanh toán
export const deletePayment = async (req, res) => {
  try {
    const id = req.params.id;
    await executeMysqlQuery(`DELETE FROM payments WHERE payment_id = ?`, [id]);
    res.send({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).send(error.message);
  }
};
