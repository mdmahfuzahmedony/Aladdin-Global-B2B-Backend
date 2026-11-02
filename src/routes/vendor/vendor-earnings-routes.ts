
import { Router } from "express";
import { requireAuth } from "../../middleware/auth-middleware";
import { createVendorPayoutRequest, getVendorEarningsSummary, getVendorEarningTransactions } from "../../controllers/vendor/vendor-earnings-controller";

const router = Router();

// Authentication required for every endpoint.
router.use(requireAuth);

router.get("/summary", getVendorEarningsSummary);
router.get("/transactions", getVendorEarningTransactions);
router.post("/payouts", createVendorPayoutRequest);

export default router;
