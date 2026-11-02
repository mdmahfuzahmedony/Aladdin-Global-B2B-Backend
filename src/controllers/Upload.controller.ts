import { Response } from "express";
import crypto from "crypto";
import path from "path";

import { AuthRequest } from "../middleware/auth-middleware";
import { supabaseAdmin } from "../config/supabase-admin";

const BUCKET_NAME = "product-images";

export async function uploadProductImage(
  req: AuthRequest,
  res: Response
) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "Image file is required",
      });
    }

    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        error: "Only image files are allowed",
      });
    }

    const extension = path.extname(file.originalname).toLowerCase();

    const safeName =
      path
        .basename(file.originalname, extension)
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80) || "image";

    const filePath = `products/${crypto.randomUUID()}-${safeName}${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);

      return res.status(500).json({
        success: false,
        error: uploadError.message,
      });
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return res.status(201).json({
      success: true,
      data: {
        url: publicUrl,
        path: filePath,
      },
    });
  } catch (error: any) {
    console.error("Product image upload error:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Image upload failed",
    });
  }
}

export async function deleteProductImage(
  req: AuthRequest,
  res: Response
) {
  try {
    const { path: requestedPath, url } = req.body;

    let filePath = String(requestedPath || "").trim();

    if (!filePath && url) {
      const marker =
        `/storage/v1/object/public/${BUCKET_NAME}/`;

      const urlString = String(url);

      const index = urlString.indexOf(marker);

      if (index !== -1) {
        filePath = decodeURIComponent(
          urlString.substring(index + marker.length)
        );
      }
    }

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: "Image path or URL is required",
      });
    }

    if (!filePath.startsWith("products/")) {
      return res.status(400).json({
        success: false,
        error: "Invalid product image path",
      });
    }

    const { error: deleteError } =
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

    if (deleteError) {
      console.error(
        "Supabase delete error:",
        deleteError
      );

      return res.status(500).json({
        success: false,
        error: deleteError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: {
        path: filePath,
        url: url || null,
      },
    });
  } catch (error: any) {
    console.error(
      "Product image delete error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message || "Image delete failed",
    });
  }
}

export async function uploadStoreImage(
  req: AuthRequest,
  res: Response
) {
  try {
    const file = req.file;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "লগইন করা নেই",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "Image file is required",
      });
    }

    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        error: "Only image files are allowed",
      });
    }

    const extension =
      path.extname(file.originalname).toLowerCase();

    const safeName =
      path
        .basename(file.originalname, extension)
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80) || "store-image";

    const filePath =
      `stores/${req.user.id}/${crypto.randomUUID()}-${safeName}${extension}`;

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

    if (uploadError) {
      console.error(
        "Supabase store image upload error:",
        uploadError
      );

      return res.status(500).json({
        success: false,
        error: uploadError.message,
      });
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return res.status(201).json({
      success: true,
      data: {
        url: publicUrl,
        path: filePath,
      },
    });
  } catch (error: any) {
    console.error(
      "Store image upload error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message || "Store image upload failed",
    });
  }
}

export async function uploadBannerImage(
  req: AuthRequest,
  res: Response
) {
  try {
    const file = req.file;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "লগইন করা নেই",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "Image file is required",
      });
    }

    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        error: "Only image files are allowed",
      });
    }

    const extension =
      path.extname(file.originalname).toLowerCase();

    const safeName =
      path
        .basename(file.originalname, extension)
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80) || "banner-image";

    const filePath =
      `banners/${crypto.randomUUID()}-${safeName}${extension}`;

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

    if (uploadError) {
      console.error(
        "Supabase banner image upload error:",
        uploadError
      );

      return res.status(500).json({
        success: false,
        error: uploadError.message,
      });
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return res.status(201).json({
      success: true,
      data: {
        url: publicUrl,
        path: filePath,
      },
    });
  } catch (error: any) {
    console.error(
      "Banner image upload error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message || "Banner image upload failed",
    });
  }
}

/* =========================================================
   CATEGORY IMAGE UPLOAD
========================================================= */

export async function uploadCategoryImage(
  req: AuthRequest,
  res: Response
) {
  try {
    const file = req.file;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "লগইন করা নেই",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "Category image is required",
      });
    }

    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        error: "Only image files are allowed",
      });
    }

    const extension =
      path.extname(file.originalname).toLowerCase();

    const safeName =
      path
        .basename(file.originalname, extension)
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80) || "category-image";

    const filePath =
      `categories/${crypto.randomUUID()}-${safeName}${extension}`;

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

    if (uploadError) {
      console.error(
        "Supabase category image upload error:",
        uploadError
      );

      return res.status(500).json({
        success: false,
        error: uploadError.message,
      });
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return res.status(201).json({
      success: true,
      data: {
        url: publicUrl,
        path: filePath,
      },
    });
  } catch (error: any) {
    console.error(
      "Category image upload error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message || "Category image upload failed",
    });
  }
}