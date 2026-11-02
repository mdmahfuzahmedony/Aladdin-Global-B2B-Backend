import { Router } from "express";

import { requireAuth } from "../../middleware/auth-middleware";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../../controllers/customer/wishlist-controller";

const router = Router();

router.get("/", requireAuth, getWishlist);

router.post("/", requireAuth, addToWishlist);

router.delete("/:itemId", requireAuth, removeFromWishlist);

router.delete("/", requireAuth, clearWishlist);

export default router;