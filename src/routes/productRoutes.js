import express from "express";
import { registerProduct } from "../controllers/productController.js";
import { getAllProducts } from "../controllers/productController.js";
import { getProductById } from "../controllers/productController.js";
import { updateProduct } from "../controllers/productController.js";
import { deleteProduct } from "../controllers/productController.js";

const router = express.Router();

router.post("/newProduct", registerProduct);
router.get("/allProducts", getAllProducts);
router.get("/product/:id", getProductById);
router.put("/updateProduct/:id", updateProduct);
router.delete("/deleteProduct/:id", deleteProduct);

export default router;
