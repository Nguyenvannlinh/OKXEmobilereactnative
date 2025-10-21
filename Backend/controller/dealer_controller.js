import { executeMysqlQuery } from "../config/db.js";
import Dealer from "../models/dealer.js";

export const getAllDealers = async (req, res) => {
  try {
    const dealers = await executeMysqlQuery(`
      SELECT d.*, u.username, u.email, u.phone_number 
      FROM dealers d 
      LEFT JOIN users u ON d.user_id = u.user_id
    `);
    res.send(dealers);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getDealerById = async (req, res) => {
  try {
    const id = req.params.id;
    const dealer = await executeMysqlQuery(`
      SELECT d.*, u.username, u.email, u.phone_number 
      FROM dealers d 
      LEFT JOIN users u ON d.user_id = u.user_id 
      WHERE d.dealer_id = ?
    `, [id]);
    res.send(dealer[0] || {});
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const createDealer = async (req, res) => {
  try {
    const dealer = new Dealer(req.body);
    await executeMysqlQuery(
      `INSERT INTO dealers (user_id, dealer_name, address, business_license, is_verified) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        dealer.user_id,
        dealer.dealer_name,
        dealer.address,
        dealer.business_license,
        dealer.is_verified || false
      ]
    );
    res.send(dealer);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const updateDealer = async (req, res) => {
  try {
    const id = req.params.id;
    const dealer = new Dealer(req.body);
    await executeMysqlQuery(
      `UPDATE dealers SET 
       user_id = ?, dealer_name = ?, address = ?, business_license = ?, is_verified = ?
       WHERE dealer_id = ?`,
      [
        dealer.user_id,
        dealer.dealer_name,
        dealer.address,
        dealer.business_license,
        dealer.is_verified,
        id
      ]
    );
    res.send(dealer);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const deleteDealer = async (req, res) => {
  try {
    const id = req.params.id;
    await executeMysqlQuery(`DELETE FROM dealers WHERE dealer_id = ?`, [id]);
    res.send({ message: "Dealer deleted successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getDealersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const dealers = await executeMysqlQuery(
      `SELECT * FROM dealers WHERE user_id = ?`,
      [userId]
    );
    res.send(dealers);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const verifyDealer = async (req, res) => {
  try {
    const id = req.params.id;
    await executeMysqlQuery(
      `UPDATE dealers SET is_verified = TRUE WHERE dealer_id = ?`,
      [id]
    );
    res.send({ message: "Dealer verified successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};