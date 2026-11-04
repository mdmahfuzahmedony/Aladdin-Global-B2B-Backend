import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { prisma } from "./config/prisma";

// Existing routes
import userRoutes from "./routes/user-routes";
import vendorRoutes from "./routes/vendor.routes";
import otpRoutes from "./routes/otp.routes";
import managerRoutes from "./routes/manager.routes";
import wholesalerRoutes from "./routes/wholesaler.routes";
import affiliateRoutes from "./routes/affiliate.routes";
import categoryRoutes from "./routes/Category.routes";
import uploadRoutes from "./routes/upload.routes";
import productRoutes from "./routes/product.routes";
import brandRoutes from "./routes/Brand.routes";
import customerRoutes from "./routes/customer.routes";

import settingsRoutes from "./routes/admin/settings.routes";
import supportRoutes from "./routes/admin/support.routes";
import mediaRoutes from "./routes/admin/media.routes";
import notificationRoutes from "./routes/admin/notification-routes";
import activityRoutes from "./routes/admin/activity-routes";
import adminOverviewRoutes from "./routes/admin/admin-overview.routes";

import cartRoutes from "./routes/customer/cart.routes";
import wishlistRoutes from "./routes/customer/wishlist.routes";
import faqRoutes from "./routes/HomePage/FAQ.routes";
import customerNotificationRoutes from "./routes/customer/notification.routes";
import bannerRoutes from "./routes/admin/banner.routes";

import vendorOrderRoutes from "./routes/vendor/vendor-order-routes";
import customerOrderRoutes from "./routes/customer/customer-order-routes";
import adminOrderRoutes from "./routes/admin/admin-order.routes";

import vendorDashboardRoutes from "./routes/vendor/vendor-dashboard-routes";
import vendorEarningsRoutes from "./routes/vendor/vendor-earnings-routes";
import vendorReviewRoutes from "./routes/vendor/vendor-review-routes";
import productReviewRoutes from "./routes/product-review-routes";
import vendorReportsRoutes from "./routes/vendor/vendor-reports-routes";

import courierRoutes from "./routes/courier.routes";
import adminReportRoute from "./routes/admin/admin-report-route";
import adminFinanceRoutes from "./routes/admin/admin-finance-route";
import customerPaymentRoutes from "./routes/customer/customer-payment.routes";
import customerRewardRoutes from "./routes/customer/customer-reward-routes";
import paymentsRoutes from "./routes/payments/payments.routes";

const app = express();

console.log("🔥 THIS INDEX.TS IS RUNNING");

// =====================================================
// CORS
// =====================================================
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// =====================================================
// BODY PARSER
// =====================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================================
// ROOT + TEST ROUTES
// =====================================================
app.get("/", (_req, res) => {
  return res.status(200).send("API is running...");
});


app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});



// =====================================================
// CART + WISHLIST
// =====================================================
app.use("/api/customer/cart", cartRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);

// =====================================================
// BRAND + FAQ + BANNER + CUSTOMER NOTIFICATIONS
// =====================================================
app.use("/api/brands", brandRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/customer/notifications", customerNotificationRoutes);

// =====================================================
// ADMIN ROUTES
// =====================================================
app.use("/api/admin/activity", activityRoutes);
app.use("/api/admin/overview", adminOverviewRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/admin/notifications", notificationRoutes);
app.use("/api/vendors/reports", vendorReportsRoutes);
app.use("/api/admin/reports", adminReportRoute);
app.use("/api/admin/finance", adminFinanceRoutes);

// =====================================================
// USER + COURIER ROUTES
// =====================================================
app.use("/api/users", userRoutes);
app.use("/api/courier", courierRoutes);
app.use("/steadfast", courierRoutes);

// =====================================================
// SPECIFIC VENDOR ROUTES
// Keep these before /api/vendors
// =====================================================
app.use("/api/vendors/reviews", vendorReviewRoutes);
app.use("/api/vendors/earnings", vendorEarningsRoutes);
app.use("/api/vendors/dashboard", vendorDashboardRoutes);

// =====================================================
// GENERAL VENDOR ROUTES
// =====================================================
app.use("/api/vendors", vendorRoutes);
app.use("/api/vendor/orders", vendorOrderRoutes);

// =====================================================
// CUSTOMER ROUTES
// =====================================================
app.use("/api/customers", customerRoutes);
app.use("/api/customer/orders", customerOrderRoutes);
app.use("/api/customer/rewards", customerRewardRoutes);
app.use("/api/customers/rewards", customerRewardRoutes);

// =====================================================
// OTP
// =====================================================
app.use("/api/otp", otpRoutes);

// =====================================================
// PRODUCT ROUTES
// =====================================================
app.use("/api/products", productRoutes);
app.use("/api/products", productReviewRoutes);

// =====================================================
// PAYMENT ROUTES
// POST /api/payments/delivery/initiate
// GET  /api/payments/delivery/bkash/callback
// =====================================================
app.use("/api/payments", paymentsRoutes);

// Existing customer payment routes
app.use("/api/customer/payments", customerPaymentRoutes);

// =====================================================
// ADMIN ORDERS
// =====================================================
app.use("/api/admin/orders", adminOrderRoutes);

// =====================================================
// TEST USERS + DATABASE
// =====================================================
app.get("/api/test-users", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: unknown) {
    console.error("Test Users Error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to fetch users";

    return res.status(500).json({
      success: false,
      error: message,
    });
  }
});

// =====================================================
// WHOLESALER + AFFILIATE + MANAGER
// =====================================================
app.use("/api/wholesalers", wholesalerRoutes);
app.use("/api/affiliates", affiliateRoutes);
app.use("/api/managers", managerRoutes);

// =====================================================
// CATEGORY REQUEST LOGGER
// =====================================================
app.use("/api/categories", (req, _res, next) => {
  console.log("📦 CATEGORY REQUEST:", req.method, req.originalUrl);

  next();
});

app.use("/api/categories", categoryRoutes);

// =====================================================
// SUPPORT + UPLOAD
// =====================================================
app.use("/api/support", supportRoutes);
app.use("/api/uploads", uploadRoutes);

// =====================================================
// 404 HANDLER
// Keep after all routes
// =====================================================
app.use((req, res) => {
  console.log("❌ ROUTE NOT FOUND:", req.method, req.originalUrl);

  return res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// Keep last
// =====================================================
app.use(
  (
    error: any,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Global Error:", error);

    if (res.headersSent) {
      return next(error);
    }

    return res.status(error.status || 500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  },
);
// =====================================================
// SERVER
// =====================================================
const PORT = Number(process.env.PORT) || 5001;

const server = app.listen(PORT, () => {
  console.log("🔥 THIS INDEX.TS IS RUNNING");
  console.log(`🚀 Backend server is running on port ${PORT}`);
  console.log("🛒 Customer cart: /api/customer/cart");
  console.log("🛒 Legacy cart: /api/cart");
  console.log("📦 Customer orders: /api/customer/orders");
  console.log("💳 Payment initiation: /api/payments/delivery/initiate");
  console.log(
    "💳 Mock payment completion: /api/payments/delivery/mock/complete",
  );
  console.log("🔔 bKash callback: /api/payments/delivery/bkash/callback");
});

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================
async function shutdown() {
  console.log("Shutting down server...");

  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("Database disconnected.");
      process.exit(0);
    } catch (error) {
      console.error("Database disconnect error:", error);
      process.exit(1);
    }
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default app;
