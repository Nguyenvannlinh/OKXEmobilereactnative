import { executeMysqlQuery } from "../config/db.js";
import FuelType from "../models/fuelType.js";

export const getAllFuelTypes = async (req, res) => {
  try {
    const fuelTypes = await executeMysqlQuery("SELECT * FROM fuel_types");
    res.send(fuelTypes);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getFuelTypeById = async (req, res) => {
  try {
    const id = req.params.id;
    const fuelType = await executeMysqlQuery(
      `SELECT * FROM fuel_types WHERE fuel_type_id = ?`,
      [id]
    );
    res.send(fuelType[0] || {});
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const createFuelType = async (req, res) => {
  try {
    const fuelType = new FuelType(req.body);
    await executeMysqlQuery(
      `INSERT INTO fuel_types (name) VALUES (?)`,
      [fuelType.name]
    );
    res.send(fuelType);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const updateFuelType = async (req, res) => {
  try {
    const id = req.params.id;
    const fuelType = new FuelType(req.body);
    await executeMysqlQuery(
      `UPDATE fuel_types SET name = ? WHERE fuel_type_id = ?`,
      [fuelType.name, id]
    );
    res.send(fuelType);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const deleteFuelType = async (req, res) => {
  try {
    const id = req.params.id;
    await executeMysqlQuery(`DELETE FROM fuel_types WHERE fuel_type_id = ?`, [id]);
    res.send({ message: "Fuel type deleted successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};