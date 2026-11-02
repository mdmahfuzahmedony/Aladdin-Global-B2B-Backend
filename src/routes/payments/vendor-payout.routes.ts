// import { Router } from "express";
// import { authenticate } from "../middleware/auth-middleware";

// const router = Router();

// router.post("/", authenticate, (_req, res) => {
//   return res.status(501).json({
//     success: false,
//     message:
//       "Vendor payout is not enabled yet. Payout allocation and balance reservation must be configured first.",
//   });
// });

// router.get("/", authenticate, (_req, res) => {
//   return res.status(501).json({
//     success: false,
//     message: "Vendor payout history is not configured yet.",
//   });
// });

// export default router;