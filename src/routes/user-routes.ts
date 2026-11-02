
import { Router } from "express";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth-middleware";

import {
  syncUserProfile,
  getCurrentUser,
  updateCurrentUser,
  getAllUsers,
  deleteCurrentUser,
  updateAdminUserStatus,
  updateAdminUserRole,
  deleteAdminUser,
  bulkDeleteAdminUsers,
  getAdminUserDetails,
} from "../controllers/user.controller";

const router = Router();

// =========================================================
// Sync Supabase profile with database
// =========================================================
router.post("/sync-profile", syncUserProfile);

// =========================================================
// Test route
// =========================================================
router.get("/test", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "User routes are working!",
  });
});

// =========================================================
// Get logged-in user's profile and customer address
// =========================================================
router.get("/me", requireAuth, getCurrentUser);

// =========================================================
// Update logged-in user's profile and customer address
// =========================================================
router.patch("/me", requireAuth, updateCurrentUser);

// =========================================================
// Delete logged-in user's account
// =========================================================
router.delete("/me", requireAuth, deleteCurrentUser);

// =========================================================
// Admin route: Get all users
// =========================================================
router.get(
  "/admin/all-users",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  getAllUsers
);

// Admin route: Update user status
router.patch(
  "/admin/:userId/status",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  updateAdminUserStatus
);

// Admin route: Update user role
router.patch(
  "/admin/:userId/role",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  updateAdminUserRole
);

// Admin route: Bulk delete users
router.delete(
  "/admin/bulk",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  bulkDeleteAdminUsers
);

// Admin route: Delete user
router.delete(
  "/admin/:userId",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  deleteAdminUser
);

// Admin route: Get single user details
router.get(
  "/admin/:userId",
  requireAuth,
  requireRole("SUPER_ADMIN", "MANAGER"),
  getAdminUserDetails
);

export default router;

