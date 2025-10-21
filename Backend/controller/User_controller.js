import { executeMysqlQuery } from "../config/db.js";
import User from "../models/user.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await executeMysqlQuery(`
      SELECT u.*, GROUP_CONCAT(r.role_name) as roles 
      FROM users u 
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id 
      LEFT JOIN roles r ON ur.role_id = r.role_id 
      GROUP BY u.user_id
    `);
    res.send(users);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await executeMysqlQuery(`
      SELECT u.*, GROUP_CONCAT(r.role_name) as roles 
      FROM users u 
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id 
      LEFT JOIN roles r ON ur.role_id = r.role_id 
      WHERE u.user_id = ? 
      GROUP BY u.user_id
    `, [id]);
    res.send(user[0] || {});
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    const result = await executeMysqlQuery(
      `INSERT INTO users 
       (username, email, password_hash, phone_number, full_name, avatar_url, is_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user.username,
        user.email,
        user.password_hash,
        user.phone_number,
        user.full_name,
        user.avatar_url,
        user.is_verified || false
      ]
    );
    
    // Assign default role if provided
    if (user.role_id) {
      await executeMysqlQuery(
        `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
        [result.insertId, user.role_id]
      );
    }
    
    res.send({ ...user, user_id: result.insertId });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = new User(req.body);
    await executeMysqlQuery(
      `UPDATE users SET 
       username = ?, email = ?, phone_number = ?, full_name = ?, avatar_url = ?, is_verified = ?
       WHERE user_id = ?`,
      [
        user.username,
        user.email,
        user.phone_number,
        user.full_name,
        user.avatar_url,
        user.is_verified,
        id
      ]
    );
    res.send(user);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    await executeMysqlQuery(`DELETE FROM users WHERE user_id = ?`, [id]);
    res.send({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const assignRoleToUser = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;
    await executeMysqlQuery(
      `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
      [user_id, role_id]
    );
    res.send({ message: "Role assigned successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const removeRoleFromUser = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;
    await executeMysqlQuery(
      `DELETE FROM user_roles WHERE user_id = ? AND role_id = ?`,
      [user_id, role_id]
    );
    res.send({ message: "Role removed successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};