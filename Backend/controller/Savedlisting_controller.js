import { executeMysqlQuery } from "../config/db.js";

export const getAllSavedListings = async (req, res) => {
  try {
    const savedListings = await executeMysqlQuery(`
      SELECT sl.*, u.username, l.title, l.price
      FROM saved_listings sl
      LEFT JOIN users u ON sl.user_id = u.user_id
      LEFT JOIN listings l ON sl.listing_id = l.listing_id
      ORDER BY sl.saved_at DESC
    `);
    res.send(savedListings);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getSavedListingById = async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    const savedListing = await executeMysqlQuery(
      `SELECT sl.*, u.username, l.title, l.price
       FROM saved_listings sl
       LEFT JOIN users u ON sl.user_id = u.user_id
       LEFT JOIN listings l ON sl.listing_id = l.listing_id
       WHERE sl.user_id = ? AND sl.listing_id = ?`,
      [userId, listingId]
    );
    res.send(savedListing[0] || {});
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const saveListing = async (req, res) => {
  try {
    const { user_id, listing_id } = req.body;
    await executeMysqlQuery(
      `INSERT INTO saved_listings (user_id, listing_id) VALUES (?, ?)`,
      [user_id, listing_id]
    );
    res.send({ message: "Listing saved successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const unsaveListing = async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    await executeMysqlQuery(
      `DELETE FROM saved_listings WHERE user_id = ? AND listing_id = ?`,
      [userId, listingId]
    );
    res.send({ message: "Listing removed from saved list" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getSavedListingsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const savedListings = await executeMysqlQuery(`
      SELECT sl.*, l.*, m.name as manufacturer_name, md.name as model_name,
             (SELECT image_url FROM images WHERE listing_id = l.listing_id AND is_primary = TRUE LIMIT 1) as primary_image
      FROM saved_listings sl
      LEFT JOIN listings l ON sl.listing_id = l.listing_id
      LEFT JOIN manufacturers m ON l.manufacturer_id = m.manufacturer_id
      LEFT JOIN models md ON l.model_id = md.model_id
      WHERE sl.user_id = ?
      ORDER BY sl.saved_at DESC
    `, [userId]);
    res.send(savedListings);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};