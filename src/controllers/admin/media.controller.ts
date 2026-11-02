import { Response } from "express";

import sharp from "sharp";
import { MediaCategory } from "@prisma/client";

import { prisma } from "../../config/prisma";

import { AuthRequest } from "../../middleware/auth-middleware";

import {
  uploadToStorage,
  deleteFromStorage,
} from "../../services/storage.service";

import { createActivity } from "../../services/activity-service";

// ========================================
// FILE SIZE LIMITS
// ========================================

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

// ========================================
// ALLOWED FILE TYPES
// ========================================

const allowedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const allowedVideoTypes = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

// ========================================
// CATEGORY FOLDER MAP
// ========================================

const categoryFolderMap: Record<string, string> = {
  PRODUCT: "products",
  CATEGORY: "categories",
  BRAND: "brands",
  BANNER: "banners",
  SLIDER: "sliders",
  STORE: "stores",
  PROMOTION: "promotions",
  GENERAL: "general",
};

// ========================================
// GET /api/media
// ========================================

export const getMedia = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      search = "",
      type,
      category,
    } = req.query;

    const where: any = {};

    // Search
    if (search) {
      where.OR = [
        {
          fileName: {
            contains: String(search),
            mode: "insensitive",
          },
        },
        {
          originalName: {
            contains: String(search),
            mode: "insensitive",
          },
        },
      ];
    }

    // Type filter
    if (type && type !== "ALL") {
      where.type = String(type);
    }

    // Category filter
    if (category && category !== "ALL") {
      where.category = String(category).toUpperCase() as MediaCategory;
    }

    const media = await prisma.media.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: media,
    });
  } catch (error) {
    console.error("Get Media Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch media",
    });
  }
};

// ========================================
// GET /api/media/:id
// ========================================

export const getMediaById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: media,
    });
  } catch (error) {
    console.error("Get Media By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch media",
    });
  }
};

// ========================================
// POST /api/media/upload
//
// IMAGE:
// PNG/JPG/JPEG/GIF/WEBP/AVIF
//           ↓
//        WEBP
//
// VIDEO:
// Original format
// ========================================

export const uploadMedia = async (
  req: AuthRequest,
  res: Response
) => {
  let uploadedPath: string | null = null;

  try {
    // ------------------------------------
    // File check
    // ------------------------------------

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file",
      });
    }

    // ------------------------------------
    // Request body
    // ------------------------------------

    const category = String(
      req.body.category || "GENERAL"
    ).toUpperCase();

    const altText = String(
      req.body.altText || ""
    ).trim();

    // ------------------------------------
    // Category validation
    // ------------------------------------

    const folder = categoryFolderMap[category];

    if (!folder) {
      return res.status(400).json({
        success: false,
        message: "Invalid media category",
      });
    }

    // ------------------------------------
    // File type validation
    // ------------------------------------

    const isImage = allowedImageTypes.includes(
      file.mimetype
    );

    const isVideo = allowedVideoTypes.includes(
      file.mimetype
    );

    if (!isImage && !isVideo) {
      return res.status(400).json({
        success: false,
        message: `Unsupported file type: ${file.mimetype}`,
      });
    }

    // ------------------------------------
    // File size validation
    // ------------------------------------

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return res.status(400).json({
        success: false,
        message: "Image size cannot exceed 10 MB",
      });
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return res.status(400).json({
        success: false,
        message: "Video size cannot exceed 50 MB",
      });
    }

    // ====================================
    // IMAGE → WEBP
    // ====================================

    if (isImage) {
      console.log("--------------------------------");
      console.log("IMAGE UPLOAD");
      console.log("Original name:", file.originalname);
      console.log("Original MIME:", file.mimetype);
      console.log("Original size:", file.size);
      console.log("--------------------------------");

      // ----------------------------------
      // Convert image to WebP
      // ----------------------------------

      const webpBuffer = await sharp(file.buffer, {
        animated: file.mimetype === "image/gif",
      })
        .webp({
          quality: 82,
          effort: 4,
        })
        .toBuffer();

      // ----------------------------------
      // Verify WebP conversion
      // ----------------------------------

      const metadata = await sharp(
        webpBuffer
      ).metadata();

      if (metadata.format !== "webp") {
        throw new Error(
          `WebP conversion failed. Output format: ${metadata.format}`
        );
      }

      console.log(
        "Converted format:",
        metadata.format
      );

      console.log(
        "Converted size:",
        webpBuffer.length
      );

      // ----------------------------------
      // Create unique storage filename
      //
      // IMPORTANT:
      // This is the actual file name
      // stored in Supabase.
      // ----------------------------------

      const uniqueName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}.webp`;

      const storagePath = `${folder}/${uniqueName}`;

      // ----------------------------------
      // Upload WebP to Supabase
      // ----------------------------------

      const uploaded = await uploadToStorage(
        webpBuffer,
        storagePath,
        "image/webp"
      );

      uploadedPath = uploaded.path;

      // ----------------------------------
      // Save to database
      //
      // originalName:
      // Keep user's original filename
      //
      // fileName:
      // Actual storage filename
      // ----------------------------------

      const media = await prisma.media.create({
        data: {
          fileName: uniqueName,

          // IMPORTANT:
          // Original name DOES NOT change
          originalName: file.originalname,

          type: "IMAGE",
          category: category as MediaCategory,
          url: uploaded.url,
          path: uploaded.path,
          mimeType: "image/webp",
          size: webpBuffer.length,
          altText: altText || null,
        },
      });

      console.log("--------------------------------");
      console.log("IMAGE UPLOAD SUCCESS");
      console.log("Original:", file.originalname);
      console.log("Storage:", uniqueName);
      console.log("MIME:", "image/webp");
      console.log("--------------------------------");

      // ====================================
      // CREATE ACTIVITY LOG
      // ====================================

      await createActivity({
        userId: req.user?.id,
        action: "CREATE",
        title: "Uploaded new media",
        description: `Image "${media.originalName}" was uploaded`,
        entityId: media.id,
        entityType: "MEDIA",
      });

      return res.status(201).json({
        success: true,
        message:
          "Image uploaded and converted to WebP successfully",
        data: media,
      });
    }

    // ====================================
    // VIDEO → ORIGINAL FORMAT
    // ====================================

    const extension = file.originalname.includes(".")
      ? file.originalname
          .split(".")
          .pop()
          ?.toLowerCase() || "mp4"
      : "mp4";

    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}.${extension}`;

    const storagePath = `${folder}/${uniqueName}`;

    // ------------------------------------
    // Upload video without conversion
    // ------------------------------------

    const uploaded = await uploadToStorage(
      file.buffer,
      storagePath,
      file.mimetype
    );

    uploadedPath = uploaded.path;

    // ------------------------------------
    // Save video to database
    // ------------------------------------

    const media = await prisma.media.create({
      data: {
        fileName: uniqueName,

        // Original video filename
        originalName: file.originalname,

        type: "VIDEO",
        category: category as MediaCategory,
        url: uploaded.url,
        path: uploaded.path,
        mimeType: file.mimetype,
        size: file.size,
        altText: altText || null,
      },
    });

    // ====================================
    // CREATE ACTIVITY LOG
    // ====================================

    await createActivity({
      userId: req.user?.id,
      action: "CREATE",
      title: "Uploaded new media",
      description: `Video "${media.originalName}" was uploaded`,
      entityId: media.id,
      entityType: "MEDIA",
    });

    return res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      data: media,
    });
  } catch (error) {
    console.error("Upload Media Error:", error);

    // ------------------------------------
    // Cleanup Supabase file if DB failed
    // ------------------------------------

    if (uploadedPath) {
      try {
        await deleteFromStorage(uploadedPath);
      } catch (cleanupError) {
        console.error(
          "Supabase Cleanup Error:",
          cleanupError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to upload media",
      error:
        error instanceof Error
          ? error.message
          : "Unknown upload error",
    });
  }
};

// ========================================
// PATCH /api/media/:id
// ========================================

export const updateMedia = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const {
      altText,
      category,
    } = req.body;

    // ------------------------------------
    // Find media
    // ------------------------------------

    const existingMedia =
      await prisma.media.findUnique({
        where: { id },
      });

    if (!existingMedia) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    // ------------------------------------
    // Validate category
    // ------------------------------------

    if (
      category &&
      !categoryFolderMap[
        String(category).toUpperCase()
      ]
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid media category",
      });
    }

    // ------------------------------------
    // Update
    // ------------------------------------

    const updatedMedia =
      await prisma.media.update({
        where: { id },
        data: {
          ...(altText !== undefined && {
            altText: altText
              ? String(altText).trim()
              : null,
          }),

          ...(category && {
            category: String(category).toUpperCase() as MediaCategory,
          }),
        },
      });

    // ====================================
    // UPDATE ACTIVITY LOG
    // ====================================

    await createActivity({
      userId: req.user?.id,
      action: "UPDATE",
      title: "Updated media",
      description: `Media "${updatedMedia.originalName}" was updated`,
      entityId: updatedMedia.id,
      entityType: "MEDIA",
    });

    return res.status(200).json({
      success: true,
      message: "Media updated successfully",
      data: updatedMedia,
    });
  } catch (error) {
    console.error(
      "Update Media Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update media",
    });
  }
};

// ========================================
// DELETE /api/media/:id
// ========================================

export const deleteMedia = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    // ------------------------------------
    // Find media
    // ------------------------------------

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    // ------------------------------------
    // Delete from Supabase
    // ------------------------------------

    await deleteFromStorage(media.path);

    // ------------------------------------
    // Delete from database
    // ------------------------------------

    await prisma.media.delete({
      where: { id },
    });

    // ====================================
    // DELETE ACTIVITY LOG
    // ====================================

    await createActivity({
      userId: req.user?.id,
      action: "DELETE",
      title: "Deleted media",
      description: `Media "${media.originalName}" was deleted`,
      entityId: media.id,
      entityType: "MEDIA",
    });

    return res.status(200).json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Media Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete media",
    });
  }
};

// ========================================
// GET /api/media/stats
// ========================================

export const getMediaStats = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const media = await prisma.media.findMany({
      select: {
        type: true,
        size: true,
      },
    });

    // ------------------------------------
    // Total media
    // ------------------------------------

    const totalMedia = media.length;

    // ------------------------------------
    // Image count
    // ------------------------------------

    const imageCount = media.filter(
      (item) => item.type === "IMAGE"
    ).length;

    // ------------------------------------
    // Video count
    // ------------------------------------

    const videoCount = media.filter(
      (item) => item.type === "VIDEO"
    ).length;

    // ------------------------------------
    // Storage used
    // ------------------------------------

    const storageUsed = media.reduce(
      (total, item) => total + item.size,
      0
    );

    return res.status(200).json({
      success: true,
      data: {
        totalMedia,
        imageCount,
        videoCount,
        storageUsed,
      },
    });
  } catch (error) {
    console.error(
      "Get Media Stats Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch media stats",
    });
  }
};