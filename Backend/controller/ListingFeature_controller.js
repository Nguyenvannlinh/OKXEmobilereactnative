import { executeMysqlQuery } from "../config/db.js";

// ✅ Thêm 1 feature cho listing
export const addListingFeature = async (req, res) => {
  try {
    const { listing_id, feature_id } = req.body;

    if (!listing_id || !feature_id) {
      return res.status(400).json({ message: "Missing listing_id or feature_id" });
    }

    await executeMysqlQuery(
      `INSERT INTO listing_features (listing_id, feature_id) VALUES (?, ?)`,
      [listing_id, feature_id]
    );

    res.status(201).json({ message: "Feature added to listing" });
  } catch (error) {
    console.error("❌ Error adding listing feature:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Lấy danh sách feature theo listing_id
export const getFeaturesByListing = async (req, res) => {
  try {
    const { listing_id } = req.params;
    const features = await executeMysqlQuery(
      `SELECT f.* 
       FROM listing_features lf 
       JOIN features f ON lf.feature_id = f.feature_id 
       WHERE lf.listing_id = ?`,
      [listing_id]
    );
    res.status(200).json(features);
  } catch (error) {
    console.error("❌ Error fetching features:", error);
    res.status(500).json({ message: error.message });
  }
};
