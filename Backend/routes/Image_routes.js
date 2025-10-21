import express from "express";
import upload, {
    createImage,
    deleteImage,
    getAllImages,
    getImageById,
    getImagesByListing,
    updateImage,
    uploadImage,
} from "../controller/Image_controller.js";

const router = express.Router();

// 📸 Upload ảnh thật
router.post("/upload", upload.single("image"), uploadImage);

// Các API CRUD cũ
router.get("/", getAllImages);
router.get("/:id", getImageById);
router.put("/:id", upload.single("image"), updateImage);
router.get("/listing/:listingId", getImagesByListing);
router.post("/", createImage);
router.put("/:id", updateImage);
router.delete("/:id", deleteImage);

export default router;
