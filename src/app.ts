import express from "express";
import cors from "cors";
import userRoutes from "./routes/user-routes";

const app = express();

// ---------- Global Middleware ----------
app.use(cors());          // frontend (Next.js) থেকে API call করতে দেয়ার জন্য
app.use(express.json());  // JSON body পার্স করার জন্য (multipart/form-data জন্য পরে multer লাগবে)

// ---------- Health check (deploy ঠিকমতো হয়েছে কিনা টেস্ট করার জন্য) ----------
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ---------- Routes ----------
// এই লাইনটাই সেই জায়গা — "/api/users" দিয়ে শুরু হওয়া সব request
// এখন user-routes.ts ফাইলে যাওয়া রুটগুলোতে (যেমন /sync-profile, /me) পৌঁছাবে
app.use("/api/users", userRoutes);

// এখানে ভবিষ্যতে আরও route যোগ হবে, যেমন:
// app.use("/api/vendors", vendorRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);

export default app;