import { executeMysqlQuery } from "../config/db.js";
import Feature from "../models/feature.js";

export const getAllFeatures = async (req, res) => {
  try {
    const features = await executeMysqlQuery("SELECT * FROM features");
    res.send(features);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getFeatureById = async (req, res) => {
  try {
    const id = req.params.id;
    const feature = await executeMysqlQuery(
      `SELECT * FROM features WHERE feature_id = ?`,
      [id]
    );
    res.send(feature[0] || {});
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const createFeature = async (req, res) => {
  try {
    const feature = new Feature(req.body);
    await executeMysqlQuery(
      `INSERT INTO features (name) VALUES (?)`,
      [feature.name]
    );
    res.send(feature);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const updateFeature = async (req, res) => {
  try {
    const id = req.params.id;
    const feature = new Feature(req.body);
    await executeMysqlQuery(
      `UPDATE features SET name = ? WHERE feature_id = ?`,
      [feature.name, id]
    );
    res.send(feature);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const deleteFeature = async (req, res) => {
  try {
    const id = req.params.id;
    await executeMysqlQuery(`DELETE FROM features WHERE feature_id = ?`, [id]);
    res.send({ message: "Feature deleted successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};