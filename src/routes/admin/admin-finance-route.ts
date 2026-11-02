import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth-middleware";
import {
  getFinanceOverview,
  getFinanceTransactions,
  getFinancePayouts,
  updatePayoutStatus,
} from "../../controllers/admin/admin-finance-controller";

const router = Router();

// GET /api/admin/finance/overview
router.get(
  "/overview",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "MANAGER"),
  getFinanceOverview
);

// GET /api/admin/finance/transactions
router.get(
  "/transactions",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "MANAGER"),
  getFinanceTransactions
);

// GET /api/admin/finance/payouts
router.get(
  "/payouts",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "MANAGER"),
  getFinancePayouts
);

// PUT /api/admin/finance/payouts/:id/status
router.put(
  "/payouts/:id/status",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "MANAGER"),
  updatePayoutStatus
);

export default router;
