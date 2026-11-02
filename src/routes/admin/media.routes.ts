import { Router } from "express";
import multer from "multer";

import {
  getMedia,
  getMediaById,
  getMediaStats,
  uploadMedia,
  updateMedia,
  deleteMedia,
} from "../../controllers/admin/media.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

router.get("/", getMedia);

router.get("/stats", getMediaStats);

router.get("/:id", getMediaById);

router.post(
  "/upload",
  upload.single("file"),
  uploadMedia
);

router.patch("/:id", updateMedia);

router.delete("/:id", deleteMedia);

export default router;