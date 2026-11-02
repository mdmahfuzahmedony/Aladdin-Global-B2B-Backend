import { Router } from "express";
import { createFAQ, deleteFAQ, getFAQs, getPublicFAQs, updateFAQ } from "../../controllers/HomePage/FAQ.controller";
import { requireAuth, requireRole } from "../../middleware/auth-middleware";


const router = Router();

/**
 * --------------------------------------------------------------------------
 * Public FAQ API
 * --------------------------------------------------------------------------
 * Homepage থেকে FAQ দেখানোর জন্য login লাগবে না।
 */
router.get(
  "/",
  getPublicFAQs
);

/**
 * --------------------------------------------------------------------------
 * Protected Admin FAQ APIs
 * --------------------------------------------------------------------------
 */

router.get(
  "/admin",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "MANAGER"
  ),
  getFAQs
);

router.post(
  "/",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "MANAGER"
  ),
  createFAQ
);

router.put(
  "/:id",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "MANAGER"
  ),
  updateFAQ
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(
    "SUPER_ADMIN",
    "MANAGER"
  ),
  deleteFAQ
);

export default router;