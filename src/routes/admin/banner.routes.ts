
import { Router } from "express";

import { requireAuth } from "../../middleware/auth-middleware";

import {
  createBanner,
  deleteBanner,
  getBannerById,
  getBanners,
  getPublicBannersByPlacement,
  getPublicHomepageHero,
  getPublicTopBanner,
  updateBanner,
} from "../../controllers/admin/banner-controller";

const router = Router();

// =====================================================
// ADMIN: GET ALL BANNERS
// GET /api/banners
// =====================================================

router.get("/", requireAuth, getBanners);

// =====================================================
// PUBLIC: TOP BANNERS
// GET /api/banners/public/top
// =====================================================

router.get("/public/top", getPublicTopBanner);

// =====================================================
// PUBLIC: HOMEPAGE HERO BANNERS
// GET /api/banners/public/homepage-hero
// Database placementKey: HOMEPAGE_HERO
// =====================================================

router.get("/public/homepage-hero", getPublicHomepageHero);

// =====================================================
// PUBLIC: SECTION BANNERS
// GET /api/banners/public/FLASH_SALE
// GET /api/banners/public/NEW_ARRIVALS
// GET /api/banners/public/BEST_SELLERS
// GET /api/banners/public/FEATURED_PRODUCTS
// GET /api/banners/public/TOP_RATED_PRODUCTS
// =====================================================

router.get("/public/:placement", getPublicBannersByPlacement);

// =====================================================
// ADMIN: GET SINGLE BANNER
// GET /api/banners/:id
// =====================================================

router.get("/:id", requireAuth, getBannerById);

// =====================================================
// ADMIN: CREATE BANNER
// POST /api/banners
// =====================================================

router.post("/", requireAuth, createBanner);

// =====================================================
// ADMIN: UPDATE BANNER
// PUT /api/banners/:id
// =====================================================

router.put("/:id", requireAuth, updateBanner);

// =====================================================
// ADMIN: DELETE BANNER
// DELETE /api/banners/:id
// =====================================================

router.delete("/:id", requireAuth, deleteBanner);

export default router;
