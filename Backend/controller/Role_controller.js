import { executeMysqlQuery } from "../config/db.js";
import Role from "../models/role.js";

export const getAllRoles = async (req, res) => {
  try {
    const rolesData = await executeMysqlQuery("SELECT * FROM roles");
    const roles = rolesData.map(roleData => new Role(roleData));
    res.send(roles);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getRoleById = async (req, res) => {
  try {
    const id = req.params.id;
    const rolesData = await executeMysqlQuery(
      `SELECT * FROM roles WHERE role_id = ?`,
      [id]
    );
    
    if (rolesData.length === 0) {
      return res.status(404).send({ error: "Role not found" });
    }
    
    const role = new Role(rolesData[0]);
    res.send(role);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const createRole = async (req, res) => {
  try {
    const role = new Role(req.body);
    
    const result = await executeMysqlQuery(
      `INSERT INTO roles (role_name) VALUES (?)`,
      [role.role_name]
    );
    
    role.role_id = result.insertId;
    res.status(201).send(role);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const updateRole = async (req, res) => {
  try {
    const id = req.params.id;
    const role = new Role(req.body);
    
    await executeMysqlQuery(
      `UPDATE roles SET role_name = ? WHERE role_id = ?`,
      [role.role_name, id]
    );
    
    role.role_id = parseInt(id);
    res.send(role);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const deleteRole = async (req, res) => {
  try {
    const id = req.params.id;
    await executeMysqlQuery(`DELETE FROM roles WHERE role_id = ?`, [id]);
    res.send({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getUsersByRole = async (req, res) => {
  try {
    const roleId = req.params.roleId;
    const usersData = await executeMysqlQuery(`
      SELECT u.* 
      FROM users u
      JOIN user_roles ur ON u.user_id = ur.user_id
      WHERE ur.role_id = ?
    `, [roleId]);
    
    res.send(usersData);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};