import dotenv from "dotenv";
import mysql from "mysql2";
import { promisify } from "util";


dotenv.config();

const mysql_config = {
  host: process.env.MYSQL_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
};
const pool = mysql.createPool(mysql_config);

pool.query = promisify(pool.query);

/**
 * @param {string} sql
 * @param {Array} values
 * @returns {Promise<any>}
 */
export const executeMysqlQuery = async (sql, values) => {
  try {
    return await pool.query(sql, values);
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
};