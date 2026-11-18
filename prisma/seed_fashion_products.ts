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

interface FashionProductSeed {
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
  fashionType: "clothing" | "footwear" | "accessories";
  attributes: {
    fashionType: "clothing" | "footwear" | "accessories";
    fabric?: string;
    fit?: string;
    pattern?: string;
    sleeveType?: string;
    collarType?: string;
    length?: string;
    occasion?: string;
    gender?: string;
    careInstruction?: string;
    upperMaterial?: string;
    soleMaterial?: string;
    insole?: string;
    closureType?: string;
    shoeType?: string;
    heelType?: string;
    heelHeight?: string;
    waterproof?: string;
    brand: string;
    colors: ColorVariant[];
    customSpecs?: Array<{ id: string; label: string; value: string }>;
  };
}

const fashionProducts: FashionProductSeed[] = [
  // =========================================================================
  // 1. FOOTWEAR: Formal Oxford Shoes (জুতো ১)
  // =========================================================================
  {
    title: "প্রিমিয়াম খাঁটি চামড়ার ফর্মাল অক্সফোর্ড জুতো - Men's Genuine Leather Formal Oxford Shoes",
    sku: "FASH-SHOE-OXF-001",
    slug: "mens-premium-genuine-leather-formal-oxford-shoes",
    shortDescription: "১০০% প্রিমিয়াম খাঁটি চামড়া, অ্যান্টি-স্লিপ সোল এবং অর্থোপেডিক কুশনযুক্ত আভিজাত্যপূর্ণ ফর্মাল অক্সফোর্ড শু।",
    descriptionHtml: `
      <h3>প্রিমিয়াম জেনুইন লেদার ফর্মাল জুতার বিবরণ</h3>
      <p>অফিস, কর্পোরেট মিটিং ও যেকোনো অভিজাত অনুষ্ঠানের জন্য তৈরি এই হ্যান্ডক্রাফটেড অক্সফোর্ড শু। ১০০% আসল ফুল-গ্রেইন চামড়ায় তৈরি এই জুতোটি পায়ের স্বাভাবিক আরাম বজায় রেখে আপনাকে দেয় আভিজাত্যের পূর্ণাঙ্গ অনুভূতি।</p>
      <h4>মূল বৈশিষ্ট্য ও সুবিধাসমূহ:</h4>
      <ul>
        <li><strong>১০০% খাঁটি চামড়া (Full Grain Genuine Leather):</strong> দীর্ঘস্থায়ী স্থায়িত্ব ও চকচকে প্রিমিয়াম ফিনিশ।</li>
        <li><strong>অ্যান্টি-স্লিপ রাবার সোল:</strong> যেকোনো মসৃণ টাইলস বা ভেজা ফ্লোরে শক্ত গ্রিপ বজায় রাখে।</li>
        <li><strong>মেমোরি ফোম ইনসোল:</strong> সারাদিন হাঁটাহাঁটি বা দাঁড়িয়ে থাকলেও পায়ে কোনো ক্লান্তি অনুভূত হয় না।</li>
        <li><strong>ক্লাসিক ডার্বি/অক্সফোর্ড স্টাইল:</strong> ফর্মাল স্যুট, ব্লেজার বা প্যান্টের সাথে অসাধারণ মানানসই।</li>
      </ul>
      <h4>সাইজ ও ফিটিং গাইড:</h4>
      <p>আপনার নিয়মিত সাইজ অনুযায়ী অর্ডার করুন। প্রতি জোড়া জুতার সাথে পাবেন প্রিমিয়াম শু-বক্স এবং ডাস্ট ব্যাগ।</p>
    `,
    stockQuantity: 95,
    categoryName: "Formal Footwear",
    parentCategoryName: "Footwear",
    regularPrice: 3850,
    salePrice: 3250,
    flashSalePrice: 2990,
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582845512747-e42001c95638?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 88,
    unitsSold: 240,
    fashionType: "footwear",
    attributes: {
      fashionType: "footwear",
      upperMaterial: "খাঁটি চামড়া (Genuine Leather)",
      soleMaterial: "অ্যান্টি-স্লিপ রাবার (Anti-Slip Rubber)",
      insole: "মেমোরি ফোম কুশন (Cushioned Memory Foam)",
      closureType: "ফিতা / লেইস (Lace-Up)",
      shoeType: "ফরমাল অক্সফোর্ড / ডার্বি (Formal Shoes)",
      heelType: "লো হিল (Low Heel - 1-2 inch)",
      heelHeight: "1.2 ইঞ্চি",
      waterproof: "ওয়াটার রেজিস্ট্যান্ট (Water Resistant)",
      gender: "পুরুষ (Men)",
      occasion: "অফিস / ফরমাল (Formal / Office)",
      brand: "Royal Craftsman Heritage",
      colors: [
        {
          color: "Classic Black (কালো)",
          images: [
            "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "39", stock: 10 },
            { size: "40", stock: 18 },
            { size: "41", stock: 22 },
            { size: "42", stock: 20 },
            { size: "43", stock: 12 },
            { size: "44", stock: 6 },
          ],
        },
        {
          color: "Rich Tan Brown (ট্যান বাদামি)",
          images: [
            "https://images.unsplash.com/photo-1582845512747-e42001c95638?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "39", stock: 8 },
            { size: "40", stock: 15 },
            { size: "41", stock: 18 },
            { size: "42", stock: 14 },
            { size: "43", stock: 8 },
            { size: "44", stock: 4 },
          ],
        },
        {
          color: "Dark Coffee (গাঢ় কফি)",
          images: [
            "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "40", stock: 10 },
            { size: "41", stock: 14 },
            { size: "42", stock: 12 },
            { size: "43", stock: 6 },
          ],
        },
      ],
      customSpecs: [
        { id: "fspec_lining", label: "অভ্যন্তরীণ আস্তরণ (Inner Lining)", value: "Breathable Soft Leather" },
        { id: "fspec_warranty", label: "প্যাকেজিং ও ওয়ারেন্টি", value: "৬ মাসের গ্যারান্টি সহ প্রিমিয়াম বক্স" },
      ],
    },
  },

  // =========================================================================
  // 2. FOOTWEAR: Ultra-Light Breathable Sneakers (জুতো ২)
  // =========================================================================
  {
    title: "আল্ট্রা-লাইট ব্রেথেবল ক্যাজুয়াল স্নিকার্স - Men's Ultra-Light Breathable Walking Sneakers",
    sku: "FASH-SHOE-SNK-002",
    slug: "mens-ultra-light-breathable-walking-sneakers",
    shortDescription: "সুপার লাইটওয়েট ইভিএ সোল, হাই-ব্রেথেবল মেশ আপার ও ট্রেন্ডি ডিজাইনের ক্যাজুয়াল ও রানিং শু।",
    descriptionHtml: `
      <h3>আল্ট্রা-লাইট ক্যাজুয়াল স্নিকার্সের বিস্তারিত</h3>
      <p>দৈনন্দিন চলাচল, জিম, রানিং অথবা ক্যাজুয়াল হ্যাঙ্গআউটের জন্য একদম সেরা স্নিকার্স। অতিরিক্ত বাতাস চলাচলের সুবিধাযুক্ত মেশ ফেব্রিক পা ঘেমে যাওয়ার সমস্যা রোধ করে।</p>
      <h4>বিশেষ বৈশিষ্ট্য:</h4>
      <ul>
        <li><strong>ব্রেথেবল মেশ আপার:</strong> সহজে বাতাস প্রবাহিত হয় এবং পা শুকনো ও দুর্গন্ধমুক্ত রাখে।</li>
        <li><strong>হালকা EVA ফোম সোল:</strong> ওজনে অত্যন্ত হালকা যা চলার গতিকে করে তোলে সাবলীল।</li>
        <li><strong>শক-অ্যাবজরবিং কুশন:</strong> পায়ের পাতা ও গোড়ালির ওপর চাপ কমায়।</li>
        <li><strong>ফ্যাশনেবল ডিজাইন:</strong> জিন্স, চিনোস বা ট্রাউজারের সাথে দারুণ ট্রেন্ডি লুক দেয়।</li>
      </ul>
    `,
    stockQuantity: 120,
    categoryName: "Sneakers",
    parentCategoryName: "Footwear",
    regularPrice: 2450,
    salePrice: 1950,
    flashSalePrice: 1750,
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 114,
    unitsSold: 380,
    fashionType: "footwear",
    attributes: {
      fashionType: "footwear",
      upperMaterial: "মেশ ফেব্রিক (Breathable Mesh)",
      soleMaterial: "হালকা EVA ফোম (Lightweight EVA)",
      insole: "অর্থোপেডিক এয়ার কুশন (Air Cushion)",
      closureType: "ফিতা / লেইস (Lace-Up)",
      shoeType: "স্নিকার্স (Casual Sneakers)",
      heelType: "প্ল্যাটফর্ম (Platform)",
      heelHeight: "1.5 ইঞ্চি",
      waterproof: "সাধারণ (Not Waterproof)",
      gender: "ইউনিসেক্স (Unisex)",
      occasion: "ক্যাজুয়াল / দৈনন্দিন (Casual)",
      brand: "AeroSport Active",
      colors: [
        {
          color: "Triple White (ধবধবে সাদা)",
          images: [
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "39", stock: 12 },
            { size: "40", stock: 25 },
            { size: "41", stock: 30 },
            { size: "42", stock: 28 },
            { size: "43", stock: 15 },
            { size: "44", stock: 8 },
          ],
        },
        {
          color: "Stealth Black (কালো)",
          images: [
            "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "39", stock: 10 },
            { size: "40", stock: 20 },
            { size: "41", stock: 25 },
            { size: "42", stock: 22 },
            { size: "43", stock: 14 },
            { size: "44", stock: 6 },
          ],
        },
      ],
      customSpecs: [
        { id: "fspec_weight", label: "জুতার ওজন", value: "মাত্র ২৩০ গ্রাম (অত্যন্ত হালকা)" },
      ],
    },
  },

  // =========================================================================
  // 3. FOOTWEAR: Handcrafted Suede Loafers (জুতো ৩)
  // =========================================================================
  {
    title: "হ্যান্ডক্রাফটেড সুয়েড লেদার ক্যাজুয়াল লোফার - Men's Handcrafted Suede Leather Loafers",
    sku: "FASH-SHOE-LOA-003",
    slug: "mens-handcrafted-suede-leather-penny-loafers",
    shortDescription: "ভেলভেটি সুয়েড লেদার, স্লিপ-অন সুবিধা ও সফট টিপিআর সোলের ক্লাসিক জেন্টলম্যান লোফার।",
    descriptionHtml: `
      <h3>সুয়েড লেদার ক্যাজুয়াল লোফারের বিবরণ</h3>
      <p>স্টাইলিশ এবং সহজ ব্যবহারের জন্য তৈরি এই স্লিপ-অন লোফার শু। ফিতা বাঁধার ঝামেলা ছাড়া ঝটপট পরে নেওয়া যায়, আর প্রিমিয়াম সুয়েড টেক্সচার যেকোনো ক্যাজুয়াল বা সেমি-ফর্মাল আউটফিটকে আকর্ষণীয় করে তোলে।</p>
      <h4>মূল সুবিধাসমূহ:</h4>
      <ul>
        <li><strong>সফট সুয়েড লেদার ফিনিশ:</strong> স্পর্শে নরম ও অত্যন্ত স্টাইলিশ লুক।</li>
        <li><strong>স্লিপ-অন ডিজাইন:</strong> সহজে পরা ও খোলার সুবিধা।</li>
        <li><strong>ফ্লেক্সিবল টিপিআর সোল:</strong> পা বাঁকাতে সহজ এবং দীর্ঘস্থায়ী টেকসই।</li>
      </ul>
    `,
    stockQuantity: 85,
    categoryName: "Loafers",
    parentCategoryName: "Footwear",
    regularPrice: 2890,
    salePrice: 2390,
    flashSalePrice: 2190,
    images: [
      "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.7,
    reviewsCount: 62,
    unitsSold: 190,
    fashionType: "footwear",
    attributes: {
      fashionType: "footwear",
      upperMaterial: "সুয়েড লেদার (Suede Leather)",
      soleMaterial: "টিপিআর সোল (TPR Sole)",
      closureType: "স্লিপ-অন (Slip-On / Loafer)",
      shoeType: "ক্যাজুয়াল লোফার (Loafers)",
      heelType: "ফ্ল্যাট / সমতল (Flat)",
      heelHeight: "0.8 ইঞ্চি",
      waterproof: "সাধারণ (Not Waterproof)",
      gender: "পুরুষ (Men)",
      occasion: "ক্যাজুয়াল / দৈনন্দিন (Casual)",
      brand: "Urban Gentleman Club",
      colors: [
        {
          color: "Navy Blue Suede (নেভি ব্লু)",
          images: [
            "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "39", stock: 8 },
            { size: "40", stock: 16 },
            { size: "41", stock: 20 },
            { size: "42", stock: 15 },
            { size: "43", stock: 10 },
          ],
        },
        {
          color: "Vintage Tan (ভিন্টেজ বাদামি)",
          images: [
            "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "39", stock: 6 },
            { size: "40", stock: 14 },
            { size: "41", stock: 18 },
            { size: "42", stock: 12 },
            { size: "43", stock: 8 },
          ],
        },
      ],
    },
  },

  // =========================================================================
  // 4. CLOTHING: Exclusive Embroidered Panjabi (পাঞ্জাবি)
  // =========================================================================
  {
    title: "প্রিমিয়াম সেমি-লং খাঁটি সুতি এমব্রয়ডারি পাঞ্জাবি - Men's Exclusive Cotton Embroidered Panjabi",
    sku: "FASH-CLOTH-PAN-004",
    slug: "mens-exclusive-cotton-embroidered-semi-long-panjabi",
    shortDescription: "১০০% প্রিমিয়াম সুতি কাপড়, কলার ও প্লাকেটে সূক্ষ্ম সুতার এমব্রয়ডারি কাজযুক্ত আভিজাত্যপূর্ণ পাঞ্জাবি।",
    descriptionHtml: `
      <h3>এক্সক্লুসিভ ডিজাইনার পাঞ্জাবির বিস্তারিত</h3>
      <p>ঈদ, জুম্মা, বিয়ে কিংবা যেকোনো পারিবারিক আনন্দ-উৎসবে আপনার ব্যক্তিত্বকে আরও উজ্জ্বল ও মার্জিত করতে এই পাঞ্জাবি অতুলনীয়। সেরা মানের কম্বড খাঁটি সুতির কাপড়ে নিখুঁত সেলাই ও কম্পিউটারাইজড এমব্রয়ডারি দিয়ে প্রস্তুত।</p>
      <h4>বিশেষ সুবিধাসমূহ:</h4>
      <ul>
        <li><strong>১০০% খাঁটি সুতি ফেব্রিক:</strong> গরমের দিনেও দেয় শীতল ও প্রশান্তিদায়ক অনুভূতি।</li>
        <li><strong>সূক্ষ্ম এমব্রয়ডারি কাজ:</strong> কলার, বোতামের পট্টি ও কাফে নিখুঁত নকশা।</li>
        <li><strong>চাইনিজ ম্যান্ডারিন কলার:</strong> নিখুঁত ফিটিং ও স্মার্ট আধুনিক লুক।</li>
        <li><strong>প্যাকেজিং:</strong> বিশেষ উপহার উপযোগী লাক্সারি বক্সে প্যাকেজড।</li>
      </ul>
      <h4>সাইজ চার্ট (ইঞ্চিতে):</h4>
      <p>
        <strong>M (40):</strong> চেস্ট ৪০", ঝুল ৪২", হাতা ২৪"<br/>
        <strong>L (42):</strong> চেস্ট ৪২", ঝুল ৪৪", হাতা ২৪.৫"<br/>
        <strong>XL (44):</strong> চেস্ট ৪৪", ঝুল ৪৬", হাতা ২৫"<br/>
        <strong>XXL (46):</strong> চেস্ট ৪৬", ঝুল ৪৬", হাতা ২৫.৫"
      </p>
    `,
    stockQuantity: 140,
    categoryName: "Ethnic Wear",
    parentCategoryName: "Clothing",
    regularPrice: 2850,
    salePrice: 2250,
    flashSalePrice: 1990,
    images: [
      "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 156,
    unitsSold: 510,
    fashionType: "clothing",
    attributes: {
      fashionType: "clothing",
      fabric: "১০০% খাঁটি সুতি (100% Pure Cotton)",
      fit: "রেগুলার ফিট (Regular Fit)",
      pattern: "এমব্রয়ডারি কাজ (Embroidered)",
      sleeveType: "ফুল হাতা (Full Sleeve)",
      collarType: "চাইনিজ / ম্যান্ডারিন কলার (Mandarin)",
      length: "42-46 ইঞ্চি (সেমি-লং)",
      occasion: "উৎসব ও পার্টি (Party / Festive)",
      gender: "পুরুষ (Men)",
      careInstruction: "ঠাণ্ডা পানিতে হ্যান্ড ওয়াশ (Hand Wash Cold)",
      brand: "Aarong Style Heritage",
      colors: [
        {
          color: "Royal White (ধবধবে সাদা)",
          images: [
            "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "S", stock: 8 },
            { size: "M", stock: 25 },
            { size: "L", stock: 35 },
            { size: "XL", stock: 30 },
            { size: "XXL", stock: 15 },
          ],
        },
        {
          color: "Deep Maroon (গাঢ় মেরুন)",
          images: [
            "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "M", stock: 20 },
            { size: "L", stock: 28 },
            { size: "XL", stock: 22 },
            { size: "XXL", stock: 10 },
          ],
        },
        {
          color: "Emerald Bottle Green (গাঢ় সবুজ)",
          images: [
            "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "M", stock: 18 },
            { size: "L", stock: 24 },
            { size: "XL", stock: 18 },
            { size: "XXL", stock: 8 },
          ],
        },
      ],
      customSpecs: [
        { id: "fspec_buttons", label: "বোতামের ধরন", value: "মেটাল স্ন্যাপ বাটন (অ্যান্টি-মরিচা)" },
        { id: "fspec_pocket", label: "পকেট", value: "দুই পাশে সাইড পকেট" },
      ],
    },
  },

  // =========================================================================
  // 5. CLOTHING: Pure Cotton Formal Shirt (শার্ট)
  // =========================================================================
  {
    title: "১০০% প্রিমিয়াম সুতি স্লিম-ফিট ফরমাল শার্ট - Men's Pure Cotton Slim-Fit Formal Shirt",
    sku: "FASH-CLOTH-SHT-005",
    slug: "mens-pure-cotton-slim-fit-formal-shirt",
    shortDescription: "হাই-কাউন্ট কম্বড কটন, অ্যান্টি-রিঙ্কেল ফিনিশ ও শার্প স্প্রেড কলারযুক্ত প্রিমিয়াম এক্সিকিউটিভ শার্ট।",
    descriptionHtml: `
      <h3>প্রিমিয়াম সুতি ফরমাল শার্টের বিবরণ</h3>
      <p>অফিস ও কর্পোরেট ড্রেসকোডের জন্য অত্যন্ত রুচিশীল এই ফরমাল শার্ট। উচ্চমানের কটন সুতা দিয়ে তৈরি হওয়ায় এটি দারুণ মসৃণ, সহজে কুঁচকে যায় না এবং দীর্ঘক্ষণ ফ্রেশ লুক বজায় রাখে।</p>
      <h4>মূল সুবিধাসমূহ:</h4>
      <ul>
        <li><strong>১০০% খাঁটি সুতি (Pure Egyptian Cotton Feel):</strong> নরম, আরামদায়ক ও ব্রেথেবল।</li>
        <li><strong>অ্যান্টি-রিঙ্কেল ট্রিটমেন্ট:</strong> কম কুঁচকায় এবং সহজে ইস্ত্রি করা যায়।</li>
        <li><strong>স্লিম ফিট কাটিং:</strong> বডিতে আকর্ষণীয় ও পেশাদার লুক দেয়।</li>
        <li><strong>ক্লাসিক স্প্রেড কলার:</strong> টাই পড়ার জন্য অথবা টাই ছাড়াও সমানভাবে আকর্ষণীয়।</li>
      </ul>
    `,
    stockQuantity: 110,
    categoryName: "T-Shirts & Shirts",
    parentCategoryName: "Clothing",
    regularPrice: 1950,
    salePrice: 1550,
    flashSalePrice: 1390,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1620012253295-c15c429fccf8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 92,
    unitsSold: 310,
    fashionType: "clothing",
    attributes: {
      fashionType: "clothing",
      fabric: "১০০% খাঁটি সুতি (100% Pure Cotton)",
      fit: "স্লিম ফিট (Slim Fit)",
      pattern: "সলিড / এক কালার (Solid / Plain)",
      sleeveType: "ফুল হাতা (Full Sleeve)",
      collarType: "শার্ট কলার (Spread / Classic)",
      length: "30 ইঞ্চি",
      occasion: "অফিস / ফরমাল (Formal / Office)",
      gender: "পুরুষ (Men)",
      careInstruction: "মেশিন ওয়াশ করা যাবে (Machine Wash)",
      brand: "Richman Executive",
      colors: [
        {
          color: "Sky Blue (আকাশি নীল)",
          images: [
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "S", stock: 10 },
            { size: "M", stock: 25 },
            { size: "L", stock: 35 },
            { size: "XL", stock: 25 },
            { size: "XXL", stock: 12 },
          ],
        },
        {
          color: "Crisp White (ক্লাসিক সাদা)",
          images: [
            "https://images.unsplash.com/photo-1620012253295-c15c429fccf8?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "S", stock: 12 },
            { size: "M", stock: 30 },
            { size: "L", stock: 40 },
            { size: "XL", stock: 30 },
            { size: "XXL", stock: 15 },
          ],
        },
        {
          color: "Midnight Navy (মিডনাইট নেভি)",
          images: [
            "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "M", stock: 20 },
            { size: "L", stock: 30 },
            { size: "XL", stock: 20 },
            { size: "XXL", stock: 10 },
          ],
        },
      ],
    },
  },

  // =========================================================================
  // 6. CLOTHING: Oversized Drop-Shoulder T-Shirt / Genji (গেঞ্জি / টি-শার্ট)
  // =========================================================================
  {
    title: "২২০ জিএসএম হেভিওয়েট ওভারসাইজড ড্রপ-শোল্ডার গেঞ্জি - Men's Heavyweight Oversized T-Shirt",
    sku: "FASH-CLOTH-TSH-006",
    slug: "mens-heavyweight-oversized-drop-shoulder-tshirt-genji",
    shortDescription: "২২০ জিএসএম প্রিমিয়াম কম্বড কটন, আল্ট্রা-কমফোর্ট ড্রপ শোল্ডার ও ট্রেন্ডি স্ট্রিটওয়্যার ওভারসাইজড টি-শার্ট।",
    descriptionHtml: `
      <h3>হেভিওয়েট ওভারসাইজড টি-শার্ট / গেঞ্জির বিবরণ</h3>
      <p>আধুনিক তরুণদের প্রথম পছন্দ এই হেভিওয়েট ড্রপ শোল্ডার টি-শার্ট। সাধারণ টি-শার্টের চেয়ে অনেক বেশি টেকসই, প্রিমিয়াম বায়ো-ওয়াশড কটন ফেব্রিক যা ধোয়ার পরও কুঁচকে যায় না বা রঙ নষ্ট হয় না।</p>
      <h4>বিশেষত্ব:</h4>
      <ul>
        <li><strong>২২০ জিএসএম কম্বড সুতি:</strong> পুরু ও প্রিমিয়াম ফেব্রিক কোয়ালিটি।</li>
        <li><strong>ড্রপ শোল্ডার ওভারসাইজড প্যাটার্ন:</strong> আন্তর্জাতিক স্ট্রিটওয়্যার ট্রেন্ড।</li>
        <li><strong>রিয়াকেটিভ ডাইং:</strong> শত ধোয়ায়ও রঙের গভীরতা একই থাকে।</li>
        <li><strong>লাইক্রা রিব নেকলাইন:</strong> গলার অংশ সহজে ঢিলে বা নষ্ট হয় না।</li>
      </ul>
    `,
    stockQuantity: 150,
    categoryName: "T-Shirts & Polo Shirts",
    parentCategoryName: "Clothing",
    regularPrice: 1150,
    salePrice: 850,
    flashSalePrice: 750,
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 185,
    unitsSold: 670,
    fashionType: "clothing",
    attributes: {
      fashionType: "clothing",
      fabric: "১০০% খাঁটি সুতি (100% Pure Cotton)",
      fit: "ওভারসাইজড (Oversized)",
      pattern: "সলিড / এক কালার (Solid / Plain)",
      sleeveType: "হাফ হাতা (Half Sleeve)",
      collarType: "গোল গলা (Crew / Round Neck)",
      length: "29-31 ইঞ্চি",
      occasion: "ক্যাজুয়াল / দৈনন্দিন (Casual)",
      gender: "ইউনিসেক্স (Unisex)",
      careInstruction: "মেশিন ওয়াশ করা যাবে (Machine Wash)",
      brand: "Urban Street Lab",
      colors: [
        {
          color: "Jet Black (জেট ব্ল্যাক)",
          images: [
            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "M", stock: 30 },
            { size: "L", stock: 45 },
            { size: "XL", stock: 40 },
            { size: "XXL", stock: 20 },
          ],
        },
        {
          color: "Vintage Off-White (অফ-হোয়াইট বেজ)",
          images: [
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "M", stock: 25 },
            { size: "L", stock: 35 },
            { size: "XL", stock: 30 },
            { size: "XXL", stock: 15 },
          ],
        },
        {
          color: "Olive Green (অলিভ সবুজ)",
          images: [
            "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "M", stock: 20 },
            { size: "L", stock: 30 },
            { size: "XL", stock: 25 },
            { size: "XXL", stock: 12 },
          ],
        },
      ],
      customSpecs: [
        { id: "fspec_gsm", label: "ফেব্রিক ঘনত্ব (GSM)", value: "220 GSM Heavy Combed Cotton" },
      ],
    },
  },

  // =========================================================================
  // 7. CLOTHING: Premium Pique Cotton Polo Shirt (পোলো শার্ট / গেঞ্জি)
  // =========================================================================
  {
    title: "প্রিমিয়াম পিকে কটন ক্লাসিক ফিট পোলো শার্ট - Men's Premium Pique Cotton Polo Shirt",
    sku: "FASH-CLOTH-POL-007",
    slug: "mens-premium-pique-cotton-classic-fit-polo-shirt",
    shortDescription: "বায়ো-ওয়াশড পিকে কটন, ডাবল-টিপড রিব কলার এবং এমব্রয়ডারি লোগোযুক্ত স্মার্ট ক্যাজুয়াল পোলো।",
    descriptionHtml: `
      <h3>ক্লাসিক পিকে কটন পোলো শার্টের বিস্তারিত</h3>
      <p>অফিস ফ্রাইডে, বন্ধুদের সাথে আড্ডা বা যেকোনো সেমি-ক্যাজুয়াল অনুষ্ঠানে মার্জিত লুকের জন্য এই পোলো শার্ট পারফেক্ট। টেকসই পিকে বুনন শরীরের সাথে দারুণ মানানসই থাকে এবং সহজে বাতাস চলাচলে সহায়তা করে।</p>
      <h4>প্রধান বৈশিষ্ট্য:</h4>
      <ul>
        <li><strong>১০০% কম্বড পিকে সুতি:</strong> খাঁটি টেক্সচার্ড সুতি কাপড়।</li>
        <li><strong>রিইনফোর্সড বোতাম পট্টি:</strong> সহজে ছিঁড়ে না ও নিখুঁত ফিনিশ।</li>
        <li><strong>সাইড স্লিট ডিজাইন:</strong> কোমরে আটকে থাকে না, চলাচলে স্বাচ্ছন্দ্য দেয়।</li>
      </ul>
    `,
    stockQuantity: 105,
    categoryName: "T-Shirts & Polo Shirts",
    parentCategoryName: "Clothing",
    regularPrice: 1450,
    salePrice: 1150,
    flashSalePrice: 990,
    images: [
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1625910513413-7a9cfcb12c3b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 78,
    unitsSold: 280,
    fashionType: "clothing",
    attributes: {
      fashionType: "clothing",
      fabric: "কটন ব্লেন্ড (Cotton Blend)",
      fit: "রেগুলার ফিট (Regular Fit)",
      pattern: "সলিড / এক কালার (Solid / Plain)",
      sleeveType: "হাফ হাতা (Half Sleeve)",
      collarType: "পোলো কলার (Polo Collar)",
      length: "28-30 ইঞ্চি",
      occasion: "ক্যাজুয়াল / দৈনন্দিন (Casual)",
      gender: "পুরুষ (Men)",
      careInstruction: "মেশিন ওয়াশ করা যাবে (Machine Wash)",
      brand: "Gentleman Polo Club",
      colors: [
        {
          color: "Royal Navy Blue (রয়েল নেভি ব্লু)",
          images: [
            "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1625910513413-7a9cfcb12c3b?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "M", stock: 25 },
            { size: "L", stock: 35 },
            { size: "XL", stock: 30 },
            { size: "XXL", stock: 15 },
          ],
        },
        {
          color: "Wine Maroon (ওয়াইন মেরুন)",
          images: [
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
          ],
          sizes: [
            { size: "M", stock: 20 },
            { size: "L", stock: 25 },
            { size: "XL", stock: 20 },
            { size: "XXL", stock: 10 },
          ],
        },
      ],
    },
  },
];

async function main() {
  console.log("🌱 Starting Fashion Products Seeding with Variants...");

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
  // Ensure "Fashion" root category exists
  let fashionRoot = await prisma.category.findFirst({
    where: {
      name: { equals: "Fashion", mode: "insensitive" },
    },
  });

  if (!fashionRoot) {
    fashionRoot = await prisma.category.create({
      data: {
        name: "Fashion",
        slug: "fashion",
      },
    });
    console.log(`📁 Created Root Category: Fashion (${fashionRoot.id})`);
  }

  // Ensure "Men's Fashion" exists under "Fashion"
  let mensFashion = await prisma.category.findFirst({
    where: {
      name: { contains: "Men", mode: "insensitive" },
      parentId: fashionRoot.id,
    },
  });

  if (!mensFashion) {
    mensFashion = await prisma.category.create({
      data: {
        name: "Men's Fashion",
        slug: "mens-fashion",
        parent: { connect: { id: fashionRoot.id } },
      },
    });
    console.log(`📁 Created Category: Men's Fashion (${mensFashion.id})`);
  }

  // Ensure "Footwear" exists under "Men's Fashion"
  let footwearCat = await prisma.category.findFirst({
    where: {
      name: { contains: "Footwear", mode: "insensitive" },
    },
  });

  if (!footwearCat) {
    footwearCat = await prisma.category.create({
      data: {
        name: "Footwear",
        slug: "footwear",
        parent: { connect: { id: mensFashion.id } },
      },
    });
    console.log(`📁 Created Category: Footwear (${footwearCat.id})`);
  }

  // Ensure "Clothing" exists under "Men's Fashion"
  let clothingCat = await prisma.category.findFirst({
    where: {
      name: { contains: "Clothing", mode: "insensitive" },
    },
  });

  if (!clothingCat) {
    clothingCat = await prisma.category.create({
      data: {
        name: "Clothing",
        slug: "clothing",
        parent: { connect: { id: mensFashion.id } },
      },
    });
    console.log(`📁 Created Category: Clothing (${clothingCat.id})`);
  }

  // Flash sale timer boundaries
  const flashSaleStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const flashSaleEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // New arrivals timer boundaries
  const newArrivalStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newArrivalEnd = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < fashionProducts.length; i++) {
    const item = fashionProducts[i];

    // Determine category
    let targetCat = await prisma.category.findFirst({
      where: {
        name: { equals: item.categoryName, mode: "insensitive" },
      },
    });

    if (!targetCat) {
      const parentId =
        item.parentCategoryName === "Footwear"
          ? footwearCat.id
          : clothingCat.id;

      targetCat = await prisma.category.create({
        data: {
          name: item.categoryName,
          slug: item.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          parent: { connect: { id: parentId } },
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
      console.log(`🔄 Updating existing fashion product: ${item.title}`);
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

      // Update or create Pricing
      await prisma.productPricing.upsert({
        where: { productId: existing.id },
        create: {
          productId: existing.id,
          customerRegularPrice: item.regularPrice,
          customerSalePrice: item.salePrice,
          sellerRegularPrice: Math.round(item.regularPrice * 0.85),
          sellerSalePrice: Math.round(item.salePrice * 0.85),
          affiliateCommissionType: "PERCENTAGE",
          affiliateCommissionValue: 6,
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
          reviewSnippet: "১০০% প্রিমিয়াম কোয়ালিটি ও পারফেক্ট ফিটিং।",
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
          featuredBadgeText: "Fashion Choice",
          bannerImage: item.images[0],
          displayOrder: i + 1,
        },
        update: {
          featuredBadgeText: "Fashion Choice",
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
      console.log(`✨ Creating new fashion product: ${item.title}`);
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
              affiliateCommissionValue: 6,
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
              reviewSnippet: "১০০% প্রিমিয়াম কোয়ালিটি ও পারফেক্ট ফিটিং।",
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
              featuredBadgeText: "Fashion Choice",
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

      console.log(`✅ Created product with ID: ${newProduct.id}`);
    }
  }

  console.log("🎉 Successfully seeded 7 Professional Fashion Variant Products!");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
