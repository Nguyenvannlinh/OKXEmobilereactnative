import { executeMysqlQuery } from "../config/db.js";
import Listing from "../models/listing.js";

export const getAllListings = async (req, res) => {
  try {
    // Lấy danh sách sản phẩm
    const listings = await executeMysqlQuery(`
      SELECT 
        l.*,
        m.name AS manufacturer_name,
        md.name AS model_name,
        bt.name AS body_type,
        ft.name AS fuel_type,
        t.name AS transmission,
        u.username,
        u.phone_number
      FROM listings l
      LEFT JOIN manufacturers m ON l.manufacturer_id = m.manufacturer_id
      LEFT JOIN models md ON l.model_id = md.model_id
      LEFT JOIN body_types bt ON l.body_type_id = bt.body_type_id
      LEFT JOIN fuel_types ft ON l.fuel_type_id = ft.fuel_type_id
      LEFT JOIN transmissions t ON l.transmission_id = t.transmission_id
      LEFT JOIN users u ON l.user_id = u.user_id
      ORDER BY l.created_at DESC
    `);

    // Lấy toàn bộ ảnh
    const images = await executeMysqlQuery(`SELECT listing_id, image_url, is_primary FROM images`);

    // Gắn ảnh vào từng listing
    const listingsWithImages = listings.map(l => ({
      ...l,
      images: images.filter(img => img.listing_id === l.listing_id),
      main_image: images.find(img => img.listing_id === l.listing_id && img.is_primary)?.image_url || null
    }));

    res.json(listingsWithImages);
  } catch (error) {
    console.error("❌ Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const getListingById = async (req, res) => {
  const { id } = req.params;
  try {
    const listingRows = await executeMysqlQuery(
      `
      SELECT 
        l.listing_id,
        l.title,
        l.description,
        l.price,
        l.price_negotiable,
        l.odometer,
        l.year_of_manufacture,
        l.year_of_registration,
        l.color,
        l.province_city,
        l.view_count,
        l.status,
        m.name AS manufacturer_name,
        md.name AS model_name,
        f.name AS fuel_type,
        t.name AS transmission,
        u.full_name AS seller_name,
        u.phone_number AS seller_phone,
        i.image_url AS main_image
      FROM listings l
      JOIN manufacturers m ON l.manufacturer_id = m.manufacturer_id
      JOIN models md ON l.model_id = md.model_id
      LEFT JOIN fuel_types f ON l.fuel_type_id = f.fuel_type_id
      LEFT JOIN transmissions t ON l.transmission_id = t.transmission_id
      JOIN users u ON l.user_id = u.user_id
      LEFT JOIN images i ON l.listing_id = i.listing_id AND i.is_primary = TRUE
      WHERE l.listing_id = ?
      LIMIT 1
      `,
      [id]
    );

    if (listingRows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    res.json(listingRows[0]);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};



export const createListing = async (req, res) => {
  try {
    const {
      user_id,
      title,
      description,
      price,
      odometer,
      manufacturer_id,
      model_id,
      body_type_id,
      fuel_type_id,
      transmission_id,
      year_of_manufacture,
      year_of_registration,
      province_city,
      color,
      number_of_seats,
      status,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "Thiếu user_id người bán" });
    }

    const result = await executeMysqlQuery(
      `INSERT INTO listings (
        user_id, title, description, price, odometer,
        manufacturer_id, model_id, body_type_id, fuel_type_id, transmission_id,
        year_of_manufacture, year_of_registration, province_city, color, number_of_seats, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(user_id),
        title,
        description,
        Number(price) || 0,
        Number(odometer) || 0,
        manufacturer_id ? Number(manufacturer_id) : null,
        model_id ? Number(model_id) : null,
        body_type_id ? Number(body_type_id) : null,
        fuel_type_id ? Number(fuel_type_id) : null,
        transmission_id ? Number(transmission_id) : null,
        year_of_manufacture,
        year_of_registration,
        province_city,
        color,
        number_of_seats ? Number(number_of_seats) : null,
        status || "pending",
      ]
    );

    res.status(201).json({
      message: "Listing created successfully",
      listing_id: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error creating listing:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateListing = async (req, res) => {
  try {
    const id = req.params.id;
    const listing = new Listing(req.body);
    await executeMysqlQuery(
      `UPDATE listings SET 
       title = ?, description = ?, price = ?, price_negotiable = ?, odometer = ?,
       manufacturer_id = ?, model_id = ?, body_type_id = ?, fuel_type_id = ?, transmission_id = ?,
       year_of_manufacture = ?, year_of_registration = ?, province_city = ?, color = ?, 
       number_of_seats = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE listing_id = ?`,
      [
        listing.title,
        listing.description,
        listing.price,
        listing.price_negotiable,
        listing.odometer,
        listing.manufacturer_id,
        listing.model_id,
        listing.body_type_id,
        listing.fuel_type_id,
        listing.transmission_id,
        listing.year_of_manufacture,
        listing.year_of_registration,
        listing.province_city,
        listing.color,
        listing.number_of_seats,
        listing.status,
        id
      ]
    );
    res.send(listing);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};

export const deleteListing = async (req, res) => {
  try {
    const id = req.params.id;

    await executeMysqlQuery(`DELETE FROM images WHERE listing_id = ?`, [id]);
    await executeMysqlQuery(`DELETE FROM listings WHERE listing_id = ?`, [id]);

    res.send({ message: "Listing and related images deleted successfully" });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).send(error.message);
  }
};


export const getListingsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const listings = await executeMysqlQuery(`
      SELECT 
        l.*,
        m.name AS manufacturer_name,
        md.name AS model_name,
        bt.name AS body_type,
        ft.name AS fuel_type,
        t.name AS transmission,
        u.username,
        u.phone_number
      FROM listings l
      LEFT JOIN manufacturers m ON l.manufacturer_id = m.manufacturer_id
      LEFT JOIN models md ON l.model_id = md.model_id
      LEFT JOIN body_types bt ON l.body_type_id = bt.body_type_id
      LEFT JOIN fuel_types ft ON l.fuel_type_id = ft.fuel_type_id
      LEFT JOIN transmissions t ON l.transmission_id = t.transmission_id
      LEFT JOIN users u ON l.user_id = u.user_id
      WHERE l.user_id = ?
      ORDER BY l.created_at DESC
    `, [userId]);

    const images = await executeMysqlQuery(`SELECT listing_id, image_url, is_primary FROM images`);

    const listingsWithImages = listings.map(l => ({
      ...l,
      images: images.filter(img => img.listing_id === l.listing_id),
      main_image: images.find(img => img.listing_id === l.listing_id && img.is_primary)?.image_url || null
    }));

    res.json(listingsWithImages);
  } catch (error) {
    console.error("❌ Error executing query:", error);
    res.status(500).send(error.message);
  }
};
