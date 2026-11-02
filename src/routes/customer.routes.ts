import { Router } from "express";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth-middleware";

import {
  getMyCustomerLocation,
  updateMyCustomerLocation,
  dismissLocationReminder,
} from "../controllers/customer.controller";

const router = Router();

// CUSTOMER LOCATION

// Get logged-in customer's saved location
router.get(
  "/location",
  requireAuth,
  requireRole("CUSTOMER"),
  getMyCustomerLocation
);

// Create / update logged-in customer's location
router.put(
  "/location",
  requireAuth,
  requireRole("CUSTOMER"),
  updateMyCustomerLocation
);

// Dismiss location reminder
router.patch(
  "/location/reminder/dismiss",
  requireAuth,
  requireRole("CUSTOMER"),
  dismissLocationReminder
);

export default router;