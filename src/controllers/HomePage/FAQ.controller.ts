import { Response } from "express";
import { AuthRequest } from "../../middleware/auth-middleware";
import { prisma } from "../../config/prisma";



/**
 * --------------------------------------------------------------------------
 * Public: Get active FAQs
 * --------------------------------------------------------------------------
 */
export async function getPublicFAQs(
  req: AuthRequest,
  res: Response
) {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
      select: {
        id: true,
        question: true,
        answer: true,
      },
    });

    return res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error: any) {
    console.error("Get public FAQs error:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "FAQs fetch করা যায়নি",
    });
  }
}

/**
 * --------------------------------------------------------------------------
 * Admin: Get all FAQs
 * --------------------------------------------------------------------------
 */
export async function getFAQs(
  req: AuthRequest,
  res: Response
) {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error: any) {
    console.error("Get FAQs error:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "FAQs fetch করা যায়নি",
    });
  }
}

/**
 * --------------------------------------------------------------------------
 * Admin: Create FAQ
 * --------------------------------------------------------------------------
 */
export async function createFAQ(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      question,
      answer,
      isActive = true,
      sortOrder = 0,
    } = req.body;

    if (!question?.trim() || !answer?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Question এবং answer দুটোই দিতে হবে",
      });
    }

    const faq = await prisma.fAQ.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        isActive: Boolean(isActive),
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: "FAQ তৈরি হয়েছে",
      data: faq,
    });
  } catch (error: any) {
    console.error("Create FAQ error:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "FAQ তৈরি করা যায়নি",
    });
  }
}

/**
 * --------------------------------------------------------------------------
 * Admin: Update FAQ
 * --------------------------------------------------------------------------
 */
export async function updateFAQ(
  req: AuthRequest,
  res: Response
) {
  try {
    const id = String(req.params.id);

    const {
      question,
      answer,
      isActive,
      sortOrder,
    } = req.body;

    const existingFAQ = await prisma.fAQ.findUnique({
      where: {
        id,
      },
    });

    if (!existingFAQ) {
      return res.status(404).json({
        success: false,
        error: "FAQ পাওয়া যায়নি",
      });
    }

    const faq = await prisma.fAQ.update({
      where: {
        id,
      },
      data: {
        ...(question !== undefined && {
          question: String(question).trim(),
        }),

        ...(answer !== undefined && {
          answer: String(answer).trim(),
        }),

        ...(isActive !== undefined && {
          isActive: Boolean(isActive),
        }),

        ...(sortOrder !== undefined && {
          sortOrder: Number(sortOrder) || 0,
        }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "FAQ update হয়েছে",
      data: faq,
    });
  } catch (error: any) {
    console.error("Update FAQ error:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "FAQ update করা যায়নি",
    });
  }
}

/**
 * --------------------------------------------------------------------------
 * Admin: Delete FAQ
 * --------------------------------------------------------------------------
 */
export async function deleteFAQ(
  req: AuthRequest,
  res: Response
) {
  try {
    const id = String(req.params.id);

    const existingFAQ = await prisma.fAQ.findUnique({
      where: {
        id,
      },
    });

    if (!existingFAQ) {
      return res.status(404).json({
        success: false,
        error: "FAQ পাওয়া যায়নি",
      });
    }

    await prisma.fAQ.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "FAQ delete হয়েছে",
    });
  } catch (error: any) {
    console.error("Delete FAQ error:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "FAQ delete করা যায়নি",
    });
  }
}