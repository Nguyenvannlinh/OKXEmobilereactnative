import { executeMysqlQuery } from "../config/db.js";
import Transmission from "../models/transmission.js";

export const getAllTransmissions = async (req, res) => {
  try {
    const transmissions = await executeMysqlQuery("SELECT * FROM transmissions");
    res.send(transmissions);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getTransmissionById = async (req, res) => {
  try {
    const id = req.params.id;
    const transmission = await executeMysqlQuery(
      `SELECT * FROM transmissions WHERE transmission_id = ?`,
      [id]
    );
    res.send(transmission[0] || {});
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const createTransmission = async (req, res) => {
  try {
    const transmission = new Transmission(req.body);
    await executeMysqlQuery(
      `INSERT INTO transmissions (name) VALUES (?)`,
      [transmission.name]
    );
    res.send(transmission);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const updateTransmission = async (req, res) => {
  try {
    const id = req.params.id;
    const transmission = new Transmission(req.body);
    await executeMysqlQuery(
      `UPDATE transmissions SET name = ? WHERE transmission_id = ?`,
      [transmission.name, id]
    );
    res.send(transmission);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const deleteTransmission = async (req, res) => {
  try {
    const id = req.params.id;
    await executeMysqlQuery(`DELETE FROM transmissions WHERE transmission_id = ?`, [id]);
    res.send({ message: "Transmission deleted successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};