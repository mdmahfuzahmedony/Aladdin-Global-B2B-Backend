import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing in backend/.env");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

interface ColorVariantSize {
  size: string;
  stock: number;
}

interface ColorVariant {
  color: string;
  images: string[];
  sizes: ColorVariantSize[];
}

interface HomeProductSeed {
  title: string;
  sku: string;
  slug: string;
  shortDescription: string;
  descriptionHtml: string;
  stockQuantity: number;
  categoryName: string;
  parentCategoryName?: string;
  regularPrice: number;
  salePrice: number;
  flashSalePrice: number;
  images: string[];
  rating: number;
  reviewsCount: number;
  unitsSold: number;
  attributes: {
    brand: string;
    material?: string;
    dimensions?: string;
    warranty?: string;
    careInstruction?: string;
    roomType?: string;
    colors: ColorVariant[];
    customSpecs?: Array<{ id: string; label: string; value: string }>;
  };
}

const homeProducts: HomeProductSeed[] = [
  // =========================================================================
  // 1. BEDDING: 100% Egyptian Cotton Luxury King Size Bedsheet Set
  // =========================================================================
  {
    title: "১০০% মিশরীয় তুলা লাক্সারি কিং সাইজ বেডশিট ও ২ টি পিলো কভার সেট - 300 TC Pure Egyptian Cotton Bedsheet Set",
    sku: "HOME-BED-EGY-001",
    slug: "pure-egyptian-cotton-luxury-king-bedsheet-set",
    shortDescription: "৩০০ থ্রেড কাউন্টের ১০০% আসল ইজিপশিয়ান কটন। অতুলনীয় মসৃণতা, দীর্ঘস্থায়ী রঙ এবং রাজকীয় আরামের নিশ্চয়তা।",
    descriptionHtml: `
      <h3>৩০০ থ্রেড কাউন্ট প্রিমিয়াম মিশরীয় কটন বেডশিট</h3>
      <p>আপনার শোবার ঘরে রাজকীয় আভিজাত্য আর আরামের নিখুঁত ছোঁয়া নিয়ে আসুন আমাদের ১০০% খাঁটি ইজিপশিয়ান কটন বেডশিট সেটের সাথে। বিশ্ববিখ্যাত লং-স্ট্যাপল কটন ফাইবার দিয়ে বোনা এই বেডশিটটি সাধারণ সুতি চাদরের চেয়ে বহুগুণ বেশি মসৃণ, টেকসই এবং শ্বাসপ্রশ্বাসযোগ্য।</p>
      <h4>মূল বৈশিষ্ট্য ও সুবিধাসমূহ:</h4>
      <ul>
        <li><strong>১০০% খাঁটি মিশরীয় সুতি (Pure Egyptian Cotton):</strong> অত্যন্ত নরম, মোলায়েম ও প্রিমিয়াম সাটিন ফিনিশ যা প্রতিবার ধোয়ার পর আরও নরম হয়।</li>
        <li><strong>৩০০ থ্রেড কাউন্ট (300 TC Satin Weave):</strong> নিখুঁত ঘনত্ব যা গরমের দিনে ঠান্ডা এবং শীতের রাতে স্বাভাবিক উষ্ণতা বজায় রাখে।</li>
        <li><strong>অ্যান্টি-ফেড কালার গ্যারান্টি:</strong> রিঅ্যাক্টিভ ডাইং প্রযুক্তির কারণে বহুবার ধোয়ার পরেও কাপড়ের উজ্জ্বলতা নতুনের মতোই চকচকে থাকে।</li>
        <li><strong>পরিপূর্ণ ৩ পিস সেট:</strong> ১টি বিশাল কিং/কুইন সাইজ বেডশিট এবং ২টি ম্যাচিং স্ট্যান্ডার্ড সাইজ পিলো কভার।</li>
      </ul>
      <h4>প্যাকেজে যা যা থাকছে:</h4>
      <ul>
        <li>১ x কিং সাইজ বেডশিট (৭.৫ x ৮.৫ ফিট / ৯০ x ১০২ ইঞ্চি)</li>
        <li>২ x ম্যাচিং পিলো কভার (১৮ x ২৮ ইঞ্চি / এনভেলপ ক্লোজার)</li>
      </ul>
      <h4>যত্ন ও ধোয়ার নির্দেশিকা:</h4>
      <p>নরমাল পানিতে মেশিনে বা হাতে ধোয়া যাবে। অতিরিক্ত ক্ষারযুক্ত ব্লিচ ব্যবহার করবেন না। মাঝারি তাপে আয়রন করা যাবে।</p>
    `,
    stockQuantity: 120,
    categoryName: "Bedding & Linen",
    parentCategoryName: "Home & Living",
    regularPrice: 2850,
    salePrice: 2250,
    flashSalePrice: 1990,
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 142,
    unitsSold: 380,
    attributes: {
      brand: "LuxeHome Living",
      material: "100% Egyptian Cotton (300 TC Satin Weave)",
      dimensions: "King: 90 x 102 inch | Pillow: 18 x 28 inch",
      warranty: "Color Fade Guarantee (1 Year)",
      careInstruction: "Machine wash cold with mild detergent. Tumble dry low.",
      roomType: "Master Bedroom, Guest Room",
      colors: [
        {
          color: "Deep Royal Navy",
          images: [
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "King (7.5x8.5 ft)", stock: 35 },
            { size: "Queen (7.0x8.0 ft)", stock: 25 },
          ],
        },
        {
          color: "Sage Floral Olive",
          images: [
            "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "King (7.5x8.5 ft)", stock: 30 },
            { size: "Queen (7.0x8.0 ft)", stock: 15 },
          ],
        },
        {
          color: "Classic Ivory White",
          images: [
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "King (7.5x8.5 ft)", stock: 10 },
            { size: "Queen (7.0x8.0 ft)", stock: 5 },
          ],
        },
      ],
      customSpecs: [
        { id: "cs1", label: "Weave Type", value: "Luxury Sateen Weave" },
        { id: "cs2", label: "Thread Count", value: "300 TC Certified" },
        { id: "cs3", label: "Pillow Closure", value: "Envelope Style" },
        { id: "cs4", label: "Eco-Friendly", value: "OEKO-TEX Certified Dyeing" },
      ],
    },
  },

  // =========================================================================
  // 2. WALL DECOR: Handcrafted Solid Teak Wood Floating Wall Shelf Set (3 Pcs)
  // =========================================================================
  {
    title: "হ্যান্ডক্রাফটেড সলিড সেগুন কাঠের ফ্লোটিং ওয়াল শেলফ সেট (৩ পিস) - Solid Wood Floating Wall Shelves Set",
    sku: "HOME-DECOR-SHL-002",
    slug: "handcrafted-solid-wood-floating-wall-shelves-set",
    shortDescription: "১০০% অরিজিনাল সিজনড সেগুন কাঠ ও হিডেন হেভি-ডিউটি মেটাল ব্র্যাকেটযুক্ত প্রিমিয়াম ৩ পিস ফ্লোটিং ওয়াল শেলফ।",
    descriptionHtml: `
      <h3>হ্যান্ডমেড সলিড উডেন ফ্লোটিং ওয়াল শেলফ (৩ পিস সেট)</h3>
      <p>ঘরের ফাঁকা দেয়ালকে আকর্ষণীয় ও আধুনিক রূপ দিতে নিয়ে আসুন ১০০% প্রাকৃতিক সেগুন কাঠে তৈরি এই ফ্লোটিং ওয়াল শেলফ সেট। কোনো দৃশ্যমান ব্র্যাকেট ছাড়াই দেয়ালের সাথে নিখুঁতভাবে জুড়ে থাকে এই আধুনিক লুকের শেলফগুলো।</p>
      <h4>মূল বৈশিষ্ট্য ও সুবিধাসমূহ:</h4>
      <ul>
        <li><strong>আসল সিজনড সেগুন কাঠ:</strong> প্রাকৃতিক কাঠের রিং ও টেক্সচারযুক্ত, যা কখনো বেঁকে যায় না বা ঘুণে ধরে না।</li>
        <li><strong>হিডেন হেভি-ডিউটি ব্র্যাকেট:</strong> শেলফের ভেতরে অদৃশ্যভাবে লুকানো স্টিল রড ব্র্যাকেট প্রতিটি শেলফে ১৫ কেজি পর্যন্ত লোড নিরাপদে ধারণ করে।</li>
        <li><strong>ওয়াটার ও স্ক্র্যাচ রেজিস্ট্যান্ট ফিনিশ:</strong> প্রিমিয়াম ল্যাকার পলিশের কারণে পানি, দাগ বা ধুলাবালি সহজেই মুছে ফেলা যায়।</li>
        <li><strong>বহুমুখী ব্যবহার:</strong> লিভিং রুমের ফটো ফ্রেম, শো-পিস, ইনডোর গাছপালা কিংবা শোবার ঘরের বই সাজিয়ে রাখার জন্য একদম পারফেক্ট।</li>
      </ul>
      <h4>সাইজ ও ডাইমেনশন:</h4>
      <ul>
        <li>বড় শেলফ: ২৪ x ৬ x ১.৫ ইঞ্চি</li>
        <li>মাঝারি শেলফ: ১৮ x ৬ x ১.৫ ইঞ্চি</li>
        <li>ছোট শেলফ: ১২ x ৬ x ১.৫ ইঞ্চি</li>
        <li>সহজ ইন্সটলেশনের জন্য স্ক্রু এবং ওয়াল প্লাগ সেটের সাথে সম্পূর্ণ ফ্রি দেওয়া থাকে।</li>
      </ul>
    `,
    stockQuantity: 80,
    categoryName: "Wall Decor & Shelves",
    parentCategoryName: "Home & Living",
    regularPrice: 2450,
    salePrice: 1850,
    flashSalePrice: 1650,
    images: [
      "https://images.unsplash.com/photo-1594040226829-7f251ab46d80?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 96,
    unitsSold: 245,
    attributes: {
      brand: "UrbanCraft Woodworks",
      material: "100% Solid Seasoned Teak Wood",
      dimensions: "Set of 3: 24\", 18\", 12\" (Width) x 6\" (Depth)",
      warranty: "5-Year Wood Integrity Guarantee",
      careInstruction: "Wipe with dry or slightly damp micro-fiber cloth.",
      roomType: "Living Room, Bedroom, Office, Study Room",
      colors: [
        {
          color: "Natural Teak Finish",
          images: [
            "https://images.unsplash.com/photo-1594040226829-7f251ab46d80?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "Set of 3 (S, M, L)", stock: 35 },
          ],
        },
        {
          color: "Dark Walnut Brown",
          images: [
            "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "Set of 3 (S, M, L)", stock: 30 },
          ],
        },
        {
          color: "Modern Matte Black",
          images: [
            "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "Set of 3 (S, M, L)", stock: 15 },
          ],
        },
      ],
      customSpecs: [
        { id: "cs1", label: "Mounting Type", value: "Concealed Floating Wall Mount" },
        { id: "cs2", label: "Weight Capacity", value: "Up to 15 kg per shelf" },
        { id: "cs3", label: "Finish", value: "Eco PU Water-repellent Lacquer" },
        { id: "cs4", label: "Hardware Included", value: "Wall anchors & steel rods included" },
      ],
    },
  },

  // =========================================================================
  // 3. HOME ACCENTS: Nordic Ceramic Minimalist Modern Flower Vase Set (2 Pcs)
  // =========================================================================
  {
    title: "নর্ডিক সিরামিক আধুনিক ডেকোরেটিভ ফ্লাওয়ার ভ্যাস (২ পিস সেট) - Nordic Minimalist Ceramic Flower Vase Set",
    sku: "HOME-DECOR-VAS-003",
    slug: "nordic-minimalist-ceramic-flower-vase-set",
    shortDescription: "ম্যাট ফিনিশড প্রিমিয়াম সিরামিক আর্ট ভ্যাস। ড্রাইড ফ্লাওয়ার, পম্পাস গ্রাস কিংবা ডাইনিং টেবিলের নান্দনিক সেন্টারপিস।",
    descriptionHtml: `
      <h3>নর্ডিক মিনিমালিস্ট সিরামিক ডেকোরেশন ভ্যাস সেট</h3>
      <p>আধুনিক ইন্টেরিয়র ডিজাইনে ট্রেন্ডিং নর্ডিক ডোনাট আর্ট ভ্যাস সেট। মাটির নিখুঁত পোড়া সিরামিক আর ম্যাট টেক্সচারের মেলবন্ধন আপনার ডাইনিং টেবিল, টিভি কেবিনেট, কনসোল টেবিল কিংবা কফি টেবিলকে দেবে ইউরোপিয়ান নান্দনিক লুক।</p>
      <h4>মূল বৈশিষ্ট্য ও সুবিধাসমূহ:</h4>
      <ul>
        <li><strong>১০০% হ্যান্ডমেড সিরামিক:</strong> হাই-টেম্পারেচার ফায়ার্ড সিরামিক পাথর দিয়ে তৈরি, যা ওজনে ভারী এবং অত্যন্ত টেকসই।</li>
        <li><strong>আধুনিক অ্যাবস্ট্রাক্ট ডিজাইন:</strong> মাঝের ফাঁকা ডোনাট শেপ ড্রাইড ফ্লাওয়ার, পম্পাস গ্রাস বা ইউক্যালিপটাস পাতার সাথে অপরূপ মানায়।</li>
        <li><strong>ওয়াটারপ্রুফ গ্লেইজড ইন্টারিয়র:</strong> শুকনো ফুলের পাশাপাশি তাজা ফুল ও পানি দিয়ে সাজানোর জন্যও পুরোপুরি উপযোগী।</li>
        <li><strong>অ্যান্টি-স্ক্র্যাচ বটম প্যাড:</strong> তলায় নরম প্যাড থাকায় কাঁচের বা কাঠের টেবিলে কোনো দাগ বা স্ক্র্যাচ পড়ে না।</li>
      </ul>
      <h4>সাইজ স্পেসিফিকেশন:</h4>
      <ul>
        <li>বড় ভ্যাস: উচ্চতা ৯ ইঞ্চি, প্রস্থ ৭.৫ ইঞ্চি</li>
        <li>ছোট ভ্যাস: উচ্চতা ৭ ইঞ্চি, প্রস্থ ৬ ইঞ্চি</li>
      </ul>
    `,
    stockQuantity: 90,
    categoryName: "Vases & Centerpieces",
    parentCategoryName: "Home & Living",
    regularPrice: 1750,
    salePrice: 1290,
    flashSalePrice: 1150,
    images: [
      "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 88,
    unitsSold: 210,
    attributes: {
      brand: "Nordic Haven",
      material: "Premium High-Fired Ceramic Stoneware",
      dimensions: "Large: 9\" x 7.5\" | Medium: 7\" x 6\"",
      warranty: "Transit Safe Arrival Guarantee",
      careInstruction: "Clean with soft dry cloth or hand wash with mild soap.",
      roomType: "Dining Table, Coffee Table, TV Unit, Bookshelf",
      colors: [
        {
          color: "Matte Off-White",
          images: [
            "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "Set of 2 Vases", stock: 40 },
          ],
        },
        {
          color: "Terracotta Rust",
          images: [
            "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "Set of 2 Vases", stock: 30 },
          ],
        },
        {
          color: "Charcoal Slate Grey",
          images: [
            "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "Set of 2 Vases", stock: 20 },
          ],
        },
      ],
      customSpecs: [
        { id: "cs1", label: "Design Style", value: "Nordic Minimalist Hollow" },
        { id: "cs2", label: "Finish", value: "Matte Frosted Glaze" },
        { id: "cs3", label: "Water Compatibility", value: "100% Leak-proof for fresh flowers" },
        { id: "cs4", label: "Packaging", value: "Shockproof thermocol drop-tested box" },
      ],
    },
  },

  // =========================================================================
  // 4. STORAGE & KITCHEN: 4-Tier Heavy-Duty Rolling Metal Utility Trolley Rack
  // =========================================================================
  {
    title: "মাল্টি-ফাংশনাল ৪-টিয়ার মেটাল ইউটিলিটি কিচেন ও হোম স্টোরেজ ট্রলি - 4-Tier Heavy Duty Rolling Storage Rack",
    sku: "HOME-STOR-TRL-004",
    slug: "4-tier-heavy-duty-rolling-metal-utility-storage-trolley",
    shortDescription: "৩৬০ ডিগ্রি লকিং হুইল, অ্যান্টি-রাস্ট কার্বন স্টিল ও ৬০ কেজি লোড ক্যাপাসিটিযুক্ত মাল্টি-পারপাস মোবাইল স্টোরেজ ট্রলি।",
    descriptionHtml: `
      <h3>৪-ধাপের হেভি-ডিউটি রোলিং মেটাল ইউটিলিটি ট্রলি</h3>
      <p>রান্নাঘর, বাথরুম, ড্রেসিং টেবিল বা বাচ্চাদের পড়ার ঘরের জিনিসপত্র সাজিয়ে গুছিয়ে রাখার অল-ইন-ওয়ান সমাধান। মজবুত কার্বন স্টিল ও ৩৬০ ডিগ্রি স্মুথ চাকা থাকায় ঘরের যেকোনো জায়গায় সহজে মুভ করা যায়।</p>
      <h4>মূল বৈশিষ্ট্য ও সুবিধাসমূহ:</h4>
      <ul>
        <li><strong>অ্যান্টি-রাস্ট কার্বন স্টিল ফ্রেম:</strong> ইলেকট্রোস্ট্যাটিক পাউডার কোটিং প্রযুক্তির কারণে মরিচা পড়ে না এবং ভেজা বাথরুমেও নিরাপদ।</li>
        <li><strong>৬০ কেজি লোড ক্যাপাসিটি:</strong> প্রতিটি বাস্কেটে ১৫ কেজি করে মোট ৬০ কেজি পর্যন্ত ভারী জিনিস, মসলার বয়াম বা তরকারি অনায়াসে রাখা যায়।</li>
        <li><strong>৩৬০° মসৃণ ঘূর্ণায়মান চাকা:</strong> ৪টি প্রিমিয়াম ক্যাস্টার হুইল যার ২টিতে রয়েছে ফুট-লকিং ব্রেক, যাতে ট্রলি এক জায়গায় স্থির থাকে।</li>
        <li><strong>বাতাস চলাচলকারী জালিযুক্ত বাস্কেট:</strong> ডায়মন্ড মেশ বাস্কেট ডিজাইন বাতাস চলাচল স্বাভাবিক রাখে, ফলে ফলমূল ও পেঁয়াজ-রসুন সতেজ থাকে।</li>
      </ul>
      <h4>কোথায় কোথায় ব্যবহার করবেন:</h4>
      <ul>
        <li>রান্নাঘরে: পেঁয়াজ, আলু, মশলা, তেল ও স্ন্যাক্স সাজিয়ে রাখতে।</li>
        <li>বাথরুমে: তোয়ালে, শ্যাম্পু, স্কিন কেয়ার ও ক্লিনজার অর্গানাইজ করতে।</li>
        <li>স্টাডি বা অফিসে: বই, খাতা, স্টেশনারি ও প্রিন্টার পেপার রাখতে।</li>
      </ul>
    `,
    stockQuantity: 110,
    categoryName: "Storage & Organization",
    parentCategoryName: "Home & Living",
    regularPrice: 3200,
    salePrice: 2450,
    flashSalePrice: 2190,
    images: [
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 115,
    unitsSold: 310,
    attributes: {
      brand: "EZ-Organize",
      material: "Heavy-Gauge Carbon Steel with Powder Coating",
      dimensions: "Height: 34\" | Width: 17.5\" | Depth: 12\"",
      warranty: "2-Year Anti-Rust Warranty",
      careInstruction: "Wipe with damp cloth. No chemical cleaner required.",
      roomType: "Kitchen, Bathroom, Nursery, Home Office, Balcony",
      colors: [
        {
          color: "Matte Carbon Black",
          images: [
            "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "4-Tier Standard", stock: 50 },
          ],
        },
        {
          color: "Clean Arctic White",
          images: [
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "4-Tier Standard", stock: 40 },
          ],
        },
        {
          color: "Nordic Teal Emerald",
          images: [
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "4-Tier Standard", stock: 20 },
          ],
        },
      ],
      customSpecs: [
        { id: "cs1", label: "Total Load Capacity", value: "60 kg (15 kg per tier)" },
        { id: "cs2", label: "Wheel Features", value: "4 x 360° casters (2 with lock brake)" },
        { id: "cs3", label: "Assembly", value: "Quick 10-minute snap-on assembly" },
        { id: "cs4", label: "Corrosion Proof", value: "Triple coated anti-rust protection" },
      ],
    },
  },

  // =========================================================================
  // 5. WELLNESS & APPLIANCE: 500ml Ultrasonic Aromatherapy Diffuser & Humidifier
  // =========================================================================
  {
    title: "আল্ট্রাসনিক অ্যারোমাথেরাপি এসেনশিয়াল অয়েল ডিফিউজার ও হিউমিডিফায়ার (৫০০ মিলি) - Ultrasonic Aroma Diffuser & Humidifier",
    sku: "HOME-APPL-DIF-005",
    slug: "500ml-ultrasonic-aromatherapy-essential-oil-diffuser-humidifier",
    shortDescription: "৫০০ মিলি ট্যাংক, ৭ রঙের অ্যাম্বিয়েন্ট এলইডি লাইট, রিমোট কন্ট্রোল ও শব্দহীন আল্ট্রাসনিক প্রযুক্তির অ্যারোমা ডিফিউজার।",
    descriptionHtml: `
      <h3>৫০০ মিলি প্রিমিয়াম উডেন ফিনিশ আল্ট্রাসনিক অ্যারোমা ডিফিউজার</h3>
      <p>ক্লান্তিকর দিনের শেষে ঘরের ভেতর নিয়ে আসুন স্পা সেন্টারের মতো স্বর্গীয় সুবাস ও প্রশান্তি। এই স্মার্ট আল্ট্রাসনিক ডিফিউজারটি পানি ও এসেনশিয়াল অয়েলকে অতিসূক্ষ্ম সুগন্ধি বাষ্পে রূপান্তর করে পুরো ঘরে মনোরম পরিবেশ তৈরি করে এবং শুষ্ক বাতাস দূর করে ফুসফুস ও ত্বক সতেজ রাখে।</p>
      <h4>মূল বৈশিষ্ট্য ও সুবিধাসমূহ:</h4>
      <ul>
        <li><strong>বিশাল ৫০০ মিলি ওয়াটার ট্যাংক:</strong> একবার পানি ভরলে টানা ১০ থেকে ১২ ঘণ্টা নিরবচ্ছিন্নভাবে সুগন্ধি বাষ্প নির্গত করে।</li>
        <li><strong>অতি-নীরব আল্ট্রাসনিক প্রযুক্তি (&lt;২৩ dB):</strong> ফ্যান বা মোটরের কোনো শব্দ নেই, যা গভীর ঘুম বা পড়াশোনায় কোনো বিঘ্ন ঘটায় না।</li>
        <li><strong>৭ রঙের অ্যাম্বিয়েন্ট এলইডি নাইট লাইট:</strong> ঘরের মুড অনুযায়ী পছন্দের আলো সিলেক্ট করা যায় অথবা সফট ডিম নাইট লাইট হিসেবে ব্যবহার করা যায়।</li>
        <li><strong>অটো শাট-অফ সেফটি প্রোটেকশন:</strong> পানি শেষ হয়ে গেলে ডিভাইসটি স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যায়, ফলে শর্ট সার্কিট বা পুড়ে যাওয়ার কোনো ভয় নেই।</li>
        <li><strong>রিমোট কন্ট্রোল সুবিধাযুক্ত:</strong> বিছানা বা সোফায় শুয়েই টাইমার (১ঘণ্টা, ৩ঘণ্টা, ৬ঘণ্টা), কুয়াশার স্পিড ও লাইট কন্ট্রোল করা যায়।</li>
      </ul>
      <h4>উপকারিতা:</h4>
      <ul>
        <li>মানসিক চাপ ও ক্লান্তি দূর করে ভালো ঘুমে সহায়তা করে।</li>
        <li>এসি রুমের শুষ্কতা দূর করে ত্বক ও গলা সুস্থ রাখে।</li>
        <li>ঘরে রান্না বা ধূমপানের দুর্গন্ধ দূর করে চমৎকার সুবাস ছড়ায়।</li>
      </ul>
    `,
    stockQuantity: 100,
    categoryName: "Air Treatment & Fragrance",
    parentCategoryName: "Home & Living",
    regularPrice: 2150,
    salePrice: 1590,
    flashSalePrice: 1390,
    images: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 168,
    unitsSold: 420,
    attributes: {
      brand: "AuraZen Living",
      material: "BPA-Free Eco Plastic with Natural Wood Grain Coating",
      dimensions: "Diameter: 6.6\" | Height: 5.7\" | Weight: 420g",
      warranty: "1-Year Full Motor & Circuit Replacement Warranty",
      careInstruction: "Clean water tank once a week with vinegar and warm water.",
      roomType: "Bedroom, Living Room, Yoga Studio, Office, Spa",
      colors: [
        {
          color: "Light Oak Wood Grain",
          images: [
            "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "500ml Standard", stock: 60 },
          ],
        },
        {
          color: "Dark Walnut Wood Grain",
          images: [
            "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "500ml Standard", stock: 40 },
          ],
        },
      ],
      customSpecs: [
        { id: "cs1", label: "Tank Capacity", value: "500 ml (10-12 hours runtime)" },
        { id: "cs2", label: "Noise Level", value: "< 23 dB Ultra Quiet" },
        { id: "cs3", label: "Control", value: "Smart Wireless Remote Included" },
        { id: "cs4", label: "Safety Auto-Off", value: "Yes, Waterless Automatic Protection" },
      ],
    },
  },
];

async function main() {
  console.log("🚀 Starting Home & Living Product Seeder...");

  // 1. Get or find an approved vendor
  let vendor = await prisma.vendor.findFirst({
    where: {
      status: "APPROVED",
    },
  });

  if (!vendor) {
    vendor = await prisma.vendor.findFirst();
  }

  if (!vendor) {
    throw new Error("No vendor found in the database to link products.");
  }

  console.log(`👤 Using Vendor: ${vendor.storeName || vendor.name} (${vendor.id})`);

  // 2. Manage Category Tree
  // Ensure "Home & Living" root category exists
  let homeRoot = await prisma.category.findFirst({
    where: {
      name: { contains: "Home", mode: "insensitive" },
      parentId: null,
    },
  });

  if (!homeRoot) {
    homeRoot = await prisma.category.create({
      data: {
        name: "Home & Living",
        slug: "home-and-living",
      },
    });
    console.log(`📁 Created Root Category: Home & Living (${homeRoot.id})`);
  } else {
    console.log(`📁 Found Root Category: ${homeRoot.name} (${homeRoot.id})`);
  }

  // Flash sale timer boundaries
  const flashSaleStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const flashSaleEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // New arrivals timer boundaries
  const newArrivalStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newArrivalEnd = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < homeProducts.length; i++) {
    const item = homeProducts[i];

    // Determine category
    let targetCat = await prisma.category.findFirst({
      where: {
        name: { equals: item.categoryName, mode: "insensitive" },
      },
    });

    if (!targetCat) {
      targetCat = await prisma.category.create({
        data: {
          name: item.categoryName,
          slug: item.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          parent: { connect: { id: homeRoot.id } },
        },
      });
      console.log(`📁 Created Subcategory: ${item.categoryName} (${targetCat.id})`);
    }

    const finalCategoryId = targetCat.id;

    // Check if product exists by SKU or Slug
    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ sku: item.sku }, { slug: item.slug }],
      },
      include: {
        pricing: true,
        flashSaleAttribute: true,
        topRatedAttribute: true,
        topSellerAttribute: true,
        featuredAttribute: true,
        newArrivalAttribute: true,
      },
    });

    const totalVariantStock = item.attributes.colors.reduce((total, color) => {
      return total + color.sizes.reduce((sum, s) => sum + s.stock, 0);
    }, 0);

    const effectiveStock = totalVariantStock > 0 ? totalVariantStock : item.stockQuantity;

    if (existing) {
      console.log(`🔄 Updating existing home product: ${item.title}`);
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          title: item.title,
          shortDescription: item.shortDescription,
          description: item.descriptionHtml.trim(),
          stockQuantity: effectiveStock,
          images: item.images,
          categoryId: finalCategoryId,
          vendorId: vendor.id,
          attributes: item.attributes as any,
        },
      });

      // Pricing
      await prisma.productPricing.upsert({
        where: { productId: existing.id },
        create: {
          productId: existing.id,
          customerRegularPrice: item.regularPrice,
          customerSalePrice: item.salePrice,
          sellerRegularPrice: Math.round(item.regularPrice * 0.85),
          sellerSalePrice: Math.round(item.salePrice * 0.85),
          affiliateCommissionType: "PERCENTAGE",
          affiliateCommissionValue: 5,
        },
        update: {
          customerRegularPrice: item.regularPrice,
          customerSalePrice: item.salePrice,
          sellerRegularPrice: Math.round(item.regularPrice * 0.85),
          sellerSalePrice: Math.round(item.salePrice * 0.85),
        },
      });

      // Flash Sale
      await prisma.flashSaleAttribute.upsert({
        where: { productId: existing.id },
        create: {
          productId: existing.id,
          flashSalePrice: item.flashSalePrice,
          flashSaleStock: Math.round(effectiveStock * 0.5),
          soldCount: Math.round(item.unitsSold * 0.3),
          startTime: flashSaleStart,
          endTime: flashSaleEnd,
          discountBadge: "Trending Deal",
        },
        update: {
          flashSalePrice: item.flashSalePrice,
          startTime: flashSaleStart,
          endTime: flashSaleEnd,
        },
      });

      // Top Rated
      await prisma.topRatedAttribute.upsert({
        where: { productId: existing.id },
        create: {
          productId: existing.id,
          averageRating: item.rating,
          totalReviews: item.reviewsCount,
          reviewSnippet: "১০০% খাঁটি কোয়ালিটি ও অসাধারণ ফিনিশিং।",
        },
        update: {
          averageRating: item.rating,
          totalReviews: item.reviewsCount,
        },
      });

      // Top Seller
      await prisma.topSellerAttribute.upsert({
        where: { productId: existing.id },
        create: {
          productId: existing.id,
          unitsSold: item.unitsSold,
          salesBadge: "Best Seller",
          isExpressEligible: true,
        },
        update: {
          unitsSold: item.unitsSold,
          salesBadge: "Best Seller",
          isExpressEligible: true,
        },
      });

      // Featured
      await prisma.featuredAttribute.upsert({
        where: { productId: existing.id },
        create: {
          productId: existing.id,
          featuredBadgeText: "Home Decor Choice",
          bannerImage: item.images[0],
          displayOrder: i + 1,
        },
        update: {
          featuredBadgeText: "Home Decor Choice",
          bannerImage: item.images[0],
          displayOrder: i + 1,
        },
      });

      // New Arrival
      await prisma.newArrivalAttribute.upsert({
        where: { productId: existing.id },
        create: {
          productId: existing.id,
          badgeText: "New Arrival",
          displayOrder: i + 1,
          startDate: newArrivalStart,
          endDate: newArrivalEnd,
        },
        update: {
          badgeText: "New Arrival",
          displayOrder: i + 1,
        },
      });

      console.log(`✅ Updated: ${item.title}`);
    } else {
      console.log(`✨ Creating new home product: ${item.title}`);
      const newProduct = await prisma.product.create({
        data: {
          title: item.title,
          sku: item.sku,
          slug: item.slug,
          shortDescription: item.shortDescription,
          description: item.descriptionHtml.trim(),
          stockQuantity: effectiveStock,
          images: item.images,
          categoryId: finalCategoryId,
          vendorId: vendor.id,
          attributes: item.attributes as any,
          pricing: {
            create: {
              customerRegularPrice: item.regularPrice,
              customerSalePrice: item.salePrice,
              sellerRegularPrice: Math.round(item.regularPrice * 0.85),
              sellerSalePrice: Math.round(item.salePrice * 0.85),
              affiliateCommissionType: "PERCENTAGE",
              affiliateCommissionValue: 5,
            },
          },
          flashSaleAttribute: {
            create: {
              flashSalePrice: item.flashSalePrice,
              flashSaleStock: Math.round(effectiveStock * 0.5),
              soldCount: Math.round(item.unitsSold * 0.3),
              startTime: flashSaleStart,
              endTime: flashSaleEnd,
              discountBadge: "Trending Deal",
            },
          },
          topRatedAttribute: {
            create: {
              averageRating: item.rating,
              totalReviews: item.reviewsCount,
              reviewSnippet: "১০০% খাঁটি কোয়ালিটি ও অসাধারণ ফিনিশিং।",
            },
          },
          topSellerAttribute: {
            create: {
              unitsSold: item.unitsSold,
              salesBadge: "Best Seller",
              isExpressEligible: true,
            },
          },
          featuredAttribute: {
            create: {
              featuredBadgeText: "Home Decor Choice",
              bannerImage: item.images[0],
              displayOrder: i + 1,
            },
          },
          newArrivalAttribute: {
            create: {
              badgeText: "New Arrival",
              displayOrder: i + 1,
              startDate: newArrivalStart,
              endDate: newArrivalEnd,
            },
          },
        },
      });

      console.log(`✅ Created Home product with ID: ${newProduct.id}`);
    }
  }

  console.log("🎉 Successfully seeded 5 Realistic Home & Living Products!");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
