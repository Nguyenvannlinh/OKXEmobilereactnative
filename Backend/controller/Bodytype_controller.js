import { executeMysqlQuery } from "../config/db.js";
import BodyType from "../models/bodyType.js";

export const getAllBodyTypes = async (req, res) => {
  try {
    const bodyTypes = await executeMysqlQuery("SELECT * FROM body_types");
    res.send(bodyTypes);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getBodyTypeById = async (req, res) => {
  try {
    const id = req.params.id;
    const bodyType = await executeMysqlQuery(
      `SELECT * FROM body_types WHERE body_type_id = ?`,
      [id]
    );
    res.send(bodyType[0] || {});
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const createBodyType = async (req, res) => {
  try {
    const bodyType = new BodyType(req.body);
    await executeMysqlQuery(
      `INSERT INTO body_types (name) VALUES (?)`,
      [bodyType.name]
    );
    res.send(bodyType);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const updateBodyType = async (req, res) => {
  try {
    const id = req.params.id;
    const bodyType = new BodyType(req.body);
    await executeMysqlQuery(
      `UPDATE body_types SET name = ? WHERE body_type_id = ?`,
      [bodyType.name, id]
    );
    res.send(bodyType);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const deleteBodyType = async (req, res) => {
  try {
    const id = req.params.id;
    await executeMysqlQuery(`DELETE FROM body_types WHERE body_type_id = ?`, [id]);
    res.send({ message: "Body type deleted successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};