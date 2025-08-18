// src/routes/productRoutes.js
import express from "express";
import {
  registerProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { checkCooperativeAccess } from "../middleware/coopAccessMiddleware.js";

const router = express.Router();

// Register a new product
router.post(
  "/",
  protect, // Authenticate user
  authorizeRoles(["superadmin", "manager"]), // Only superadmins and managers can register
  checkCooperativeAccess("body"), // Ensure manager creates for their own cooperative (cooperativeId in req.body)
  registerProduct
);

// Get all products
// Superadmins can see all. Managers/Members see products from their cooperative (frontend should add cooperativeId to query).
router.get("/", protect, getAllProducts);

// Get a single product by ID
// Users can only get products if they are superadmin or if the product belongs to their cooperative.
router.get(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager", "member"]),
  checkCooperativeAccess("query"), // Check cooperativeId in query params for access
  getProductById
);

// Update a product by ID
router.put(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("body"), // Check cooperativeId in request body for update authorization
  updateProduct
);

// Delete a product by ID
router.delete(
  "/:id",
  protect,
  authorizeRoles(["superadmin", "manager"]),
  checkCooperativeAccess("body"), // Check cooperativeId in request body for delete authorization
  deleteProduct
);

export default router;
