// import { Router } from "express";
// import { authenticate } from "../middleware/auth-middleware";

// const router = Router();

// router.use(authenticate);

// router.all("*", (_req, res) => {
//   return res.status(501).json({
//     success: false,
//     message:
//       "Admin payout routes are not enabled. Connect your project's admin-role authorization middleware before enabling payout processing.",
//   });
// });

// export default router;