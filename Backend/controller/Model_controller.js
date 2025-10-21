import { executeMysqlQuery } from "../config/db.js";
import Model from "../models/model.js";

export const getAllModels = async (req, res) => {
  try {
    const models = await executeMysqlQuery(`
      SELECT 
        m.model_id,
        CAST(m.manufacturer_id AS UNSIGNED) AS manufacturer_id,
        m.name,
        m.year_introduced,
        man.name AS manufacturer_name
      FROM models m
      LEFT JOIN manufacturers man ON m.manufacturer_id = man.manufacturer_id
    `);
    res.send(models);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getModelById = async (req, res) => {
  try {
    const id = req.params.id;
    const model = await executeMysqlQuery(`
      SELECT m.*, man.name as manufacturer_name 
      FROM models m 
      LEFT JOIN manufacturers man ON m.manufacturer_id = man.manufacturer_id 
      WHERE m.model_id = ?
    `, [id]);
    res.send(model[0] || {});
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const createModel = async (req, res) => {
  try {
    const model = new Model(req.body);
    await executeMysqlQuery(
      `INSERT INTO models (manufacturer_id, name, year_introduced) VALUES (?, ?, ?)`,
      [model.manufacturer_id, model.name, model.year_introduced]
    );
    res.send(model);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const updateModel = async (req, res) => {
  try {
    const id = req.params.id;
    const model = new Model(req.body);
    await executeMysqlQuery(
      `UPDATE models SET manufacturer_id = ?, name = ?, year_introduced = ? WHERE model_id = ?`,
      [model.manufacturer_id, model.name, model.year_introduced, id]
    );
    res.send(model);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const deleteModel = async (req, res) => {
  try {
    const id = req.params.id;
    await executeMysqlQuery(`DELETE FROM models WHERE model_id = ?`, [id]);
    res.send({ message: "Model deleted successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getModelsByManufacturer = async (req, res) => {
  try {
    const manufacturerId = req.params.manufacturerId;
    const models = await executeMysqlQuery(
      `SELECT 
        model_id,
        CAST(manufacturer_id AS UNSIGNED) AS manufacturer_id,
        name,
        year_introduced
      FROM models
      WHERE manufacturer_id = ?`,
      [manufacturerId]
    );
    res.send(models);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};