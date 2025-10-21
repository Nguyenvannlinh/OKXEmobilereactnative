import { executeMysqlQuery } from "../config/db.js";
import Review from "../models/review.js";

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await executeMysqlQuery(`
      SELECT rr.*, rev.username as reviewer_name, red.username as reviewed_user_name, l.title as listing_title
      FROM reviews_ratings rr
      LEFT JOIN users rev ON rr.reviewer_id = rev.user_id
      LEFT JOIN users red ON rr.reviewed_user_id = red.user_id
      LEFT JOIN listings l ON rr.listing_id = l.listing_id
      ORDER BY rr.created_at DESC
    `);
    res.send(reviews);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getReviewById = async (req, res) => {
  try {
    const id = req.params.id;
    const review = await executeMysqlQuery(`
      SELECT rr.*, rev.username as reviewer_name, red.username as reviewed_user_name, l.title as listing_title
      FROM reviews_ratings rr
      LEFT JOIN users rev ON rr.reviewer_id = rev.user_id
      LEFT JOIN users red ON rr.reviewed_user_id = red.user_id
      LEFT JOIN listings l ON rr.listing_id = l.listing_id
      WHERE rr.review_id = ?
    `, [id]);
    res.send(review[0] || {});
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const createReview = async (req, res) => {
  try {
    const review = new Review(req.body);
    await executeMysqlQuery(
      `INSERT INTO reviews_ratings (reviewer_id, reviewed_user_id, listing_id, rating, comment) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        review.reviewer_id,
        review.reviewed_user_id,
        review.listing_id,
        review.rating,
        review.comment
      ]
    );
    res.send(review);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const updateReview = async (req, res) => {
  try {
    const id = req.params.id;
    const review = new Review(req.body);
    await executeMysqlQuery(
      `UPDATE reviews_ratings SET 
       reviewer_id = ?, reviewed_user_id = ?, listing_id = ?, rating = ?, comment = ?
       WHERE review_id = ?`,
      [
        review.reviewer_id,
        review.reviewed_user_id,
        review.listing_id,
        review.rating,
        review.comment,
        id
      ]
    );
    res.send(review);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const deleteReview = async (req, res) => {
  try {
    const id = req.params.id;
    await executeMysqlQuery(`DELETE FROM reviews_ratings WHERE review_id = ?`, [id]);
    res.send({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getReviewsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const reviews = await executeMysqlQuery(`
      SELECT rr.*, rev.username as reviewer_name, l.title as listing_title
      FROM reviews_ratings rr
      LEFT JOIN users rev ON rr.reviewer_id = rev.user_id
      LEFT JOIN listings l ON rr.listing_id = l.listing_id
      WHERE rr.reviewed_user_id = ?
      ORDER BY rr.created_at DESC
    `, [userId]);
    res.send(reviews);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getAverageRating = async (req, res) => {
  try {
    const userId = req.params.userId;
    const rating = await executeMysqlQuery(`
      SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews
      FROM reviews_ratings 
      WHERE reviewed_user_id = ?
    `, [userId]);
    res.send(rating[0] || { average_rating: 0, total_reviews: 0 });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};