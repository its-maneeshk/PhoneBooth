import { Router } from "express";
import {
  createProduct, updateProduct, deleteProduct,
  getBySlug, listProducts
} from "../controllers/product.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// Public
router.get("/", listProducts);
router.get("/:slug", getBySlug);

// Admin only
router.post("/", requireAuth, createProduct);
router.put("/:id", requireAuth, updateProduct);
router.delete("/:id", requireAuth, deleteProduct);

export default router;
