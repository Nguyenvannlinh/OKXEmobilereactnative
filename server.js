import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Import routes cho bikeshop
import authRoutes from "./Backend/routes/Auth_routes.js";
import bodyTypeRoutes from "./Backend/routes/Bodytype_router.js";
import dealerRoutes from "./Backend/routes/Dealer_routes.js";
import featureRoutes from "./Backend/routes/feature_routes.js";
import fuelTypeRoutes from "./Backend/routes/fuelType_routes.js";
import imageRoutes from "./Backend/routes/Image_routes.js";
import listingRoutes from "./Backend/routes/listing_routes.js";
import listingFeatureRoutes from "./Backend/routes/ListingFeature_routes.js";
import manufacturerRoutes from "./Backend/routes/manufacturer_routes.js";
import messageRoutes from "./Backend/routes/Message_routes.js";
import modelRoutes from "./Backend/routes/Model_router.js";
import orderRoutes from "./Backend/routes/Order_routes.js";
import paymentRoutes from "./Backend/routes/Payment_routes.js";
import provinceRoutes from "./Backend/routes/Province_routes.js";
import reviewRoutes from "./Backend/routes/Review_routes.js";
import roleRoutes from "./Backend/routes/Role_routes.js";
import savedListingRoutes from "./Backend/routes/Savedlisting_routes.js";
import transmissionRoutes from "./Backend/routes/transmission_routes.js";
import userRoutes from "./Backend/routes/User_routes.js";

// Cấu hình đường dẫn tĩnh
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// CORS config
app.use(cors({
  origin: "http://localhost:8081",
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files - phục vụ ảnh xe
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes cho bikeshop
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/manufacturers", manufacturerRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/body-types", bodyTypeRoutes);
app.use("/api/fuel-types", fuelTypeRoutes);
app.use("/api/transmissions", transmissionRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/provinces", provinceRoutes);
app.use("/api/dealers", dealerRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/saved-listings", savedListingRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/listing-features", listingFeatureRoutes);

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: '🏍️ BikeShop API is working!',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/auth',
      '/api/users', 
      '/api/listings',
      '/api/manufacturers'
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'BikeShop API',
    timestamp: new Date().toISOString()
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'BikeShop API',
    description: 'Motorcycle Marketplace REST API',
    version: '1.0.0'
  });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🏍️  BikeShop Server đang chạy trên port ${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/test`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
});