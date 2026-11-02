import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ===============================
// SEND OTP
// ===============================

export async function sendOtp(req: Request, res: Response) {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        error: "ইমেইল অ্যাড্রেস প্রয়োজন!",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otpVerification.upsert({
      where: { email },
      update: {
        otp,
        expiresAt,
      },
      create: {
        email,
        otp,
        expiresAt,
      },
    });

    await transporter.sendMail({
      from: `"Aladdin B2B" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Aladdin Verification Code",

      text: `
Your Aladdin B2B verification code is: ${otp}

This code will expire in 5 minutes.
      `,

      html: `
        <h3>Aladdin B2B Verification Code</h3>
        <p>Your verification code is:</p>
        <h2>${otp}</h2>
        <p>This code will expire in 5 minutes.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "ওটিপি সফলভাবে পাঠানো হয়েছে!",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);

    return res.status(500).json({
      error: "মেইল পাঠাতে সমস্যা হয়েছে!",
    });
  }
}

// ===============================
// VERIFY OTP
// ===============================

export async function verifyOtp(req: Request, res: Response) {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const otp = String(
      req.body.otp || req.body.enteredOtp || ""
    ).trim();

    if (!email || !otp) {
      return res.status(400).json({
        error: "ইমেইল এবং ওটিপি কোড দিতে হবে!",
      });
    }

    const record = await prisma.otpVerification.findUnique({
      where: { email },
    });

    if (!record) {
      return res.status(400).json({
        error: "কোনো ওটিপি রিকোয়েস্ট পাওয়া যায়নি!",
      });
    }

    if (new Date() > record.expiresAt) {
      await prisma.otpVerification.delete({
        where: { email },
      });

      return res.status(400).json({
        error: "কোডটির মেয়াদ শেষ হয়ে গেছে!",
      });
    }

    if (record.otp !== otp) {
      return res.status(400).json({
        error: "কোডটি সঠিক নয়!",
      });
    }

    // এখানে OTP delete করছি না।
    // Final vendor registration-এর সময় আবার verify হবে।

    return res.status(200).json({
      success: true,
      message: "ওটিপি ভেরিফিকেশন সফল হয়েছে!",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      error: "সার্ভারে সমস্যা হয়েছে!",
    });
  }
}