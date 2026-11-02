import { Router } from "express";

import { requireAuth } from "../../middleware/auth-middleware";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../../controllers/customer/cart-controller";

const router = Router();

router.get("/", requireAuth, getCart);

router.post("/", requireAuth, addToCart);

router.patch("/:itemId", requireAuth, updateCartItem);

router.delete("/:itemId", requireAuth, removeFromCart);

router.delete("/", requireAuth, clearCart);

export default router;