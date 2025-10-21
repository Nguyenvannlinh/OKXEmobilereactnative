import fs from "fs";
import multer from "multer";
import path from "path";
import { executeMysqlQuery } from "../config/db.js";
import Image from "../models/image.js";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, filename);
  },
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // giới hạn 5MB
});


// Controller upload ảnh
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { listing_id, is_primary } = req.body;
    if (!listing_id) {
      return res.status(400).json({ message: "listing_id is required" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    await executeMysqlQuery(
      `INSERT INTO images (listing_id, image_url, is_primary) VALUES (?, ?, ?)`,
      [listing_id, imageUrl, is_primary === "true" ? true : false]
    );

    return res.status(200).json({
      message: "Image uploaded and saved to database successfully",
      imageUrl,
      listing_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Upload failed" });
  }
};

export const getAllImages = async (req, res) => {
  try {
    const images = await executeMysqlQuery("SELECT * FROM images");
    res.json(images);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getImageById = async (req, res) => {
  try {
    const id = req.params.id;
    const image = await executeMysqlQuery(
      `SELECT * FROM images WHERE image_id = ?`,
      [id]
    );
    res.json(image[0] || {});
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const createImage = async (req, res) => {
  try {
    const image = new Image(req.body);
    await executeMysqlQuery(
      `INSERT INTO images (listing_id, image_url, is_primary) VALUES (?, ?, ?)`,
      [image.listing_id, image.image_url, image.is_primary || false]
    );
    res.json(image);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const updateImage = async (req, res) => {
  try {
    const id = req.params.id;
    const { listing_id, is_primary } = req.body;

    let image_url = req.body.image_url;

    // ✅ Nếu upload file mới → đổi sang /uploads/
    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const newPath = path.join("uploads", fileName);
      fs.renameSync(req.file.path, newPath);
      image_url = `/uploads/${fileName}`;
    } 
    else if (image_url && image_url.startsWith("https://example.com/")) {
      const fileName = image_url.split("/").pop(); // vios-1.jpg
      image_url = `/uploads/${fileName}`;
    }
    if (!image_url) {
      const oldImage = await executeMysqlQuery("SELECT image_url FROM images WHERE image_id = ?", [id]);
      if (oldImage.length > 0) image_url = oldImage[0].image_url;
    }

    // ✅ Cập nhật DB
    await executeMysqlQuery(
      `UPDATE images SET listing_id = ?, image_url = ?, is_primary = ? WHERE image_id = ?`,
      [listing_id, image_url, is_primary ? 1 : 0, id]
    );

    res.json({ message: "Image updated successfully", image_url });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).send(error.message);
  }
};

export const deleteImage = async (req, res) => {
  try {
    const id = req.params.id;
    const img = await executeMysqlQuery(`SELECT * FROM images WHERE image_id = ?`, [id]);
    if (img[0]?.image_url) {
      const filePath = path.join(process.cwd(), img[0].image_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await executeMysqlQuery(`DELETE FROM images WHERE image_id = ?`, [id]);
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getImagesByListing = async (req, res) => {
  try {
    const listingId = req.params.listingId;
    const images = await executeMysqlQuery(
      `SELECT * FROM images WHERE listing_id = ? ORDER BY is_primary DESC`,
      [listingId]
    );
    res.json(images);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export default upload;