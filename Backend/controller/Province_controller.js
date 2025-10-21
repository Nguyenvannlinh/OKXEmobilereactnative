import { executeMysqlQuery } from "../config/db.js";
import Province from "../models/Province.js";

export const getAllProvinces = async (req, res) => {
  try {
    const provinces = await executeMysqlQuery("SELECT * FROM provinces");
    res.send(provinces);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getProvinceById = async (req, res) => {
  try {
    const id = req.params.id;
    const province = await executeMysqlQuery(
      `SELECT * FROM provinces WHERE province_id = ?`,
      [id]
    );
    res.send(province[0] || {});
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const createProvince = async (req, res) => {
  try {
    const province = new Province(req.body);
    await executeMysqlQuery(
      `INSERT INTO provinces (name) VALUES (?)`,
      [province.name]
    );
    res.send(province);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const updateProvince = async (req, res) => {
  try {
    const id = req.params.id;
    const province = new Province(req.body);
    await executeMysqlQuery(
      `UPDATE provinces SET name = ? WHERE province_id = ?`,
      [province.name, id]
    );
    res.send(province);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const deleteProvince = async (req, res) => {
  try {
    const id = req.params.id;
    await executeMysqlQuery(`DELETE FROM provinces WHERE province_id = ?`, [id]);
    res.send({ message: "Province deleted successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};