import express from "express";
import {
    addListingFeature,
    getFeaturesByListing,
} from "../controller/ListingFeature_controller.js";

const router = express.Router();

// POST /api/listing-features
router.post("/", addListingFeature);

// GET /api/listing-features/:listing_id
router.get("/:listing_id", getFeaturesByListing);

export default router;
