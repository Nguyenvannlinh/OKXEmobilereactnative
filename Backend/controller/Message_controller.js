import { executeMysqlQuery } from "../config/db.js";
import Message from "../models/Message.js";

export const getAllMessages = async (req, res) => {
  try {
    const messages = await executeMysqlQuery(`
      SELECT m.*, s.username as sender_name, r.username as receiver_name, l.title as listing_title
      FROM messages m
      LEFT JOIN users s ON m.sender_id = s.user_id
      LEFT JOIN users r ON m.receiver_id = r.user_id
      LEFT JOIN listings l ON m.listing_id = l.listing_id
      ORDER BY m.sent_at DESC
    `);
    res.send(messages);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getMessageById = async (req, res) => {
  try {
    const id = req.params.id;
    const message = await executeMysqlQuery(`
      SELECT m.*, s.username as sender_name, r.username as receiver_name, l.title as listing_title
      FROM messages m
      LEFT JOIN users s ON m.sender_id = s.user_id
      LEFT JOIN users r ON m.receiver_id = r.user_id
      LEFT JOIN listings l ON m.listing_id = l.listing_id
      WHERE m.message_id = ?
    `, [id]);
    res.send(message[0] || {});
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const createMessage = async (req, res) => {
  try {
    const message = new Message(req.body);
    console.log("📨 Dữ liệu nhận được:", message);

    await executeMysqlQuery(
      `INSERT INTO messages (sender_id, receiver_id, listing_id, content, is_read) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        message.sender_id,
        message.receiver_id,
        message.listing_id || null,
        message.content,
        message.is_read || false
      ]
    );

    res.send(message);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const updateMessage = async (req, res) => {
  try {
    const id = req.params.id;
    const message = new Message(req.body);
    await executeMysqlQuery(
      `UPDATE messages SET 
       sender_id = ?, receiver_id = ?, listing_id = ?, content = ?, is_read = ?
       WHERE message_id = ?`,
      [
        message.sender_id,
        message.receiver_id,
        message.listing_id,
        message.content,
        message.is_read,
        id
      ]
    );
    res.send(message);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const id = req.params.id;
    await executeMysqlQuery(`DELETE FROM messages WHERE message_id = ?`, [id]);
    res.send({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getMessagesByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const messages = await executeMysqlQuery(`
      SELECT m.*, s.username as sender_name, r.username as receiver_name, l.title as listing_title
      FROM messages m
      LEFT JOIN users s ON m.sender_id = s.user_id
      LEFT JOIN users r ON m.receiver_id = r.user_id
      LEFT JOIN listings l ON m.listing_id = l.listing_id
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY m.sent_at DESC
    `, [userId, userId]);
    res.send(messages);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getConversation = async (req, res) => {
  try {
    const { user1, user2, listingId } = req.params;
    const messages = await executeMysqlQuery(`
      SELECT m.*, s.username as sender_name
      FROM messages m
      LEFT JOIN users s ON m.sender_id = s.user_id
      WHERE ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
      AND m.listing_id = ?
      ORDER BY m.sent_at ASC
    `, [user1, user2, user2, user1, listingId]);
    res.send(messages);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};