import { executeMysqlQuery } from "../config/db.js";
import Manufacturer from "../models/Manufacturer.js";

export const getAllManufacturers = async (req, res) => {
  try {
    const manufacturersData = await executeMysqlQuery("SELECT * FROM manufacturers");
    const manufacturers = manufacturersData.map(manufacturerData => new Manufacturer(manufacturerData));
    res.send(manufacturers);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getManufacturerById = async (req, res) => {
  try {
    const id = req.params.id;
    const manufacturersData = await executeMysqlQuery(
      `SELECT * FROM manufacturers WHERE manufacturer_id = ?`,
      [id]
    );
    
    if (manufacturersData.length === 0) {
      return res.status(404).send({ error: "Manufacturer not found" });
    }
    
    const manufacturer = new Manufacturer(manufacturersData[0]);
    res.send(manufacturer);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const createManufacturer = async (req, res) => {
  try {
    const manufacturer = new Manufacturer(req.body);
    
    const result = await executeMysqlQuery(
      `INSERT INTO manufacturers (name, logo_url) VALUES (?, ?)`,
      [manufacturer.name, manufacturer.logo_url]
    );
    
    manufacturer.manufacturer_id = result.insertId;
    res.status(201).send(manufacturer);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const updateManufacturer = async (req, res) => {
  try {
    const id = req.params.id;
    const manufacturer = new Manufacturer(req.body);
    
    await executeMysqlQuery(
      `UPDATE manufacturers SET name = ?, logo_url = ? WHERE manufacturer_id = ?`,
      [manufacturer.name, manufacturer.logo_url, id]
    );
    
    manufacturer.manufacturer_id = parseInt(id);
    res.send(manufacturer);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const deleteManufacturer = async (req, res) => {
  try {
    const id = req.params.id;
    await executeMysqlQuery(`DELETE FROM manufacturers WHERE manufacturer_id = ?`, [id]);
    res.send({ message: "Manufacturer deleted successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};