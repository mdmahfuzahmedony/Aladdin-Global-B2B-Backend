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

interface ProductSeedItem {
  title: string;
  sku: string;
  slug: string;
  shortDescription: string;
  descriptionHtml: string;
  stockQuantity: number;
  categorySlugOrName: string;
  regularPrice: number;
  salePrice: number;
  flashSalePrice: number;
  images: string[];
  rating: number;
  reviewsCount: number;
  unitsSold: number;
  reviewSnippet: string;
  attributes: Record<string, any>;
}

const productsToSeed: ProductSeedItem[] = [
  // =========================================================================
  // 1. BOOK: দেবী - হুমায়ূন আহমেদ
  // =========================================================================
  {
    title: "দেবী (মিসির আলি সিরিজের ১ম বই) - হুমায়ূন আহমেদ | Debi by Humayun Ahmed",
    sku: "BOOK-HUM-DEBI-001",
    slug: "debi-humayun-ahmed-misir-ali-001",
    shortDescription:
      "হুমায়ূন আহমেদের কালজয়ী মনস্তাত্ত্বিক থ্রিলার উপন্যাস। মিসির আলি চরিত্রটির প্রথম আত্মপ্রকাশ ঘটে এই বইয়ের মাধ্যমে। রহস্য, অধিবিদ্যা ও বাস্তবতার অনবদ্য মেলবন্ধন।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">বই পরিচিতি ও সারসংক্ষেপ:</h3>
  <p>
    <strong>দেবী</strong> কথাশিল্পী হুমায়ূন আহমেদের সৃষ্ট অবিস্মরণীয় মনস্তাত্ত্বিক চরিত্র <em>'মিসির আলি'</em> সিরিজের সর্বপ্রথম এবং বহুল পঠিত উপন্যাস। রানু নামের এক সাধারণ বাঙালি তরুণী, যার মাঝে অতিপ্রাকৃতিক ইন্দ্রিয় শক্তির অদ্ভুত প্রকাশ দেখা যায়। তার মনের অদেখা জগতের অমীমাংসিত রহস্য এবং যুক্তি দিয়ে সবকিছুর উত্তর খোঁজা ঢাকা বিশ্ববিদ্যালয়ের মনোবিজ্ঞান বিভাগের খণ্ডকালীন শিক্ষক মিসির আলির মধ্যকার দ্বৈরথ নিয়ে এগিয়ে চলে এই অনবদ্য উপন্যাসের কাহিনী।
  </p>
  <div class="my-4 rounded-xl bg-amber-50/70 p-4 border border-amber-200">
    <h4 class="font-bold text-amber-900 text-sm mb-1">বইটির মূল আকর্ষণ:</h4>
    <ul class="list-disc pl-5 text-xs text-amber-800 space-y-1">
      <li>মিসির আলি চরিত্রের প্রথম উপন্যাস ও ক্লাসিক সাইকোলজিক্যাল থ্রিলার</li>
      <li>রকমারি ও একুশে বইমেলার সর্বকালের অন্যতম বেস্টসেলার</li>
      <li>উচ্চমানের অফসেট পেপারে মুদ্রিত ও টেকসই হার্ডকভার বাঁধাই</li>
    </ul>
  </div>
  <p>
    যাঁরা মনস্তাত্ত্বিক থ্রিলার এবং রহস্য উপন্যাস ভালোবাসেন, তাঁদের বুকশেলফে 'দেবী' একটি অবশ্য সংগ্রাহ্য মাস্টারপিস।
  </p>
</div>
    `,
    stockQuantity: 120,
    categorySlugOrName: "Fiction Books",
    regularPrice: 280,
    salePrice: 224,
    flashSalePrice: 199,
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 384,
    unitsSold: 1240,
    reviewSnippet: "বাংলা সাহিত্যের অন্যতম শ্রেষ্ঠ সাইকোলজিক্যাল মাস্টারপিস। প্রিন্টিং কোয়ালিটি ও বাইন্ডিং চমৎকার!",
    attributes: {
      author: "হুমায়ূন আহমেদ (Humayun Ahmed)",
      publisher: "অনন্যা প্রকাশনী (Ananya)",
      edition: "পরিমার্জিত সংস্করণ (Revised Edition)",
      publicationYear: "২০২৪ (2024)",
      language: "বাংলা (Bangla)",
      coverType: "হার্ডকভার (Hardcover)",
      numberOfPages: "১২৮",
      isbn: "978-984-432-156-4",
      genre: "থ্রিলার ও রহস্য (Thriller)",
      paperType: "হোয়াইট প্রিন্ট / অফসেট (White / Offset)",
      bookWeight: "250 গ্রাম",
      countryOfOrigin: "বাংলাদেশ (Bangladesh)",
      origin: "বাংলাদেশ (Bangladesh)",
      customSpecs: [
        { id: "cs1", label: "সিরিজ", value: "মিসির আলি সিরিজ (১ম খণ্ড)" },
        { id: "cs2", label: "প্রচ্ছদ শিল্পী", value: "ধ্রুব এষ" },
      ],
    },
  },

  // =========================================================================
  // 2. BOOK: প্যারাডক্সিক্যাল সাজিদ - আরিফ আজাদ
  // =========================================================================
  {
    title: "প্যারাডক্সিক্যাল সাজিদ (১ম খণ্ড) - আরিফ আজাদ | Paradoxical Sajid by Arif Azad",
    sku: "BOOK-ARF-SAJID-001",
    slug: "paradoxical-sajid-arif-azad-001",
    shortDescription:
      "সমকালীন বিশ্বাস, যুক্তি ও বিজ্ঞানের আলোকে ইসলামি বিশ্বাসের যৌক্তিক উপস্থাপনা নিয়ে লেখা বর্তমান সময়ের শীর্ষ জনপ্রিয় বই। প্রতিটি অধ্যায়ে সাজিদের বুদ্ধিমত্তা ও যুক্তিপূর্ণ সংলাপ পাঠককে মুগ্ধ করে।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">বই পরিচিতি ও বিষয়বস্তু:</h3>
  <p>
    <strong>প্যারাডক্সিক্যাল সাজিদ</strong> তরুণ লেখক আরিফ আজাদের লেখা এক আলোড়ন সৃষ্টিকারী বই। গল্পের সাজিদ চরিত্রটি ঢাকা বিশ্ববিদ্যালয়ের একজন শিক্ষার্থী, যে প্রথমে সংশয়বাদী ও অবিশ্বাসী থাকলেও ধীরে ধীরে গভীর অধ্যবসায় ও বৈজ্ঞানিক যুক্তির নিরিখে বিশ্বাসের আলো খুঁজে পায়। বইটির প্রতিটি গল্পে প্রচলিত নাস্তিক্যবাদী যুক্তি ও দ্বিধাদ্বন্দ্বগুলোকে সহজবোধ্য বৈজ্ঞানিক তথ্য ও যুক্তির মাধ্যমে খণ্ডন করা হয়েছে।
  </p>
  <div class="my-4 rounded-xl bg-blue-50/70 p-4 border border-blue-200">
    <h4 class="font-bold text-blue-900 text-sm mb-1">পাঠকদের প্রতিক্রিয়া:</h4>
    <p class="text-xs text-blue-800 leading-normal">
      রকমারি সহ দেশের অনলাইন বুকশপে বিগত কয়েক বছর ধরে অন্যতম শীর্ষ সর্বাধিক বিক্রিত বইয়ের তালিকায় অবস্থান করছে। তরুণ প্রজন্মের চিন্তা ও মননশীলতায় এটি গভীর প্রভাব ফেলতে সক্ষম হয়েছে।
    </p>
  </div>
</div>
    `,
    stockQuantity: 250,
    categorySlugOrName: "Religion Books",
    regularPrice: 350,
    salePrice: 280,
    flashSalePrice: 255,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 520,
    unitsSold: 3200,
    reviewSnippet: "খুবই সুন্দর যুক্তি ও প্রাঞ্জল ভাষায় লেখা। প্রত্যেক তরুণ পাঠকের বইটি একবার হলেও পড়া উচিত।",
    attributes: {
      author: "আরিফ আজাদ (Arif Azad)",
      publisher: "সমকালীন প্রকাশন (Samakalin)",
      edition: "২০তম পুনর্মুদ্রণ (20th Edition)",
      publicationYear: "২০২৪ (2024)",
      language: "বাংলা (Bangla)",
      coverType: "হার্ডকভার (Hardcover)",
      numberOfPages: "১৭৬",
      isbn: "978-984-931-280-9",
      genre: "ইসলামিক ও ধর্মীয় (Islamic)",
      paperType: "৮০ জিএসএম প্রিমিয়াম অফসেট পেপার",
      bookWeight: "320 গ্রাম",
      countryOfOrigin: "বাংলাদেশ (Bangladesh)",
      origin: "বাংলাদেশ (Bangladesh)",
      customSpecs: [
        { id: "cs1", label: "খণ্ড", value: "১ম খণ্ড" },
        { id: "cs2", label: "বাঁধাই মান", value: "ডিলাক্স হার্ডবাউন্ড" },
      ],
    },
  },

  // =========================================================================
  // 3. BOOK: রিচার্জ ইউর ডাউন ব্যাটারি - ঝংকার মাহবুব
  // =========================================================================
  {
    title: "রিচার্জ ইউর ডাউন ব্যাটারি - ঝংকার মাহবুব | Recharge Your Down Battery",
    sku: "BOOK-JHK-RECHARGE-001",
    slug: "recharge-your-down-battery-jhankar-mahbub",
    shortDescription:
      "জীবনের হতাশা, অলসতা আর ব্যর্থতা কাটিয়ে আবার নতুন উদ্যমে ঝাঁপিয়ে পড়ার এক দারুণ মোটিভেশনাল গাইড। ঝংকার মাহবুবের চটপটে ও মজার ভাষায় তরুণদের মানসিক শক্তি বাড়ানোর বই।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">বইটির মূল উপজীব্য:</h3>
  <p>
    আমাদের সবার জীবনেই এমন কিছু সময় আসে যখন মনে হয়—'আমাকে দিয়ে কিচ্ছু হবে না!', মানসিক ব্যাটারি যেন একেবারে ০% এ নেমে যায়। লেখক <strong>ঝংকার মাহবুব</strong> অত্যন্ত রসালো, বাস্তবধর্মী ও পজিটিভ দৃষ্টিকোণ থেকে সেই ডাউন ব্যাটারি রিচার্জ করার কৌশল শিখিয়েছেন এই বইয়ে।
  </p>
  <ul class="list-disc pl-5 text-xs text-slate-600 space-y-1">
    <li>কীভাবে অলসতা ও কাজ পিছিয়ে দেওয়ার বদভ্যাস দূর করবেন</li>
    <li>ব্যর্থতার ভয়কে জয় করে প্রতিদিন ছোট ছোট অভ্যাসে উন্নতি করার রোডম্যাপ</li>
    <li>ক্যারিয়ার ও স্টাডিতে মনোযোগ ধরে রাখার পরীক্ষিত টেকনিক</li>
  </ul>
</div>
    `,
    stockQuantity: 95,
    categorySlugOrName: "Motivational Books",
    regularPrice: 320,
    salePrice: 256,
    flashSalePrice: 229,
    images: [
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.7,
    reviewsCount: 215,
    unitsSold: 980,
    reviewSnippet: "মন খারাপের দিনগুলোতে বইটি ম্যাজিকের মতো কাজে দেয়। ভাষা এত প্রাণবন্ত যে এক বসাতেই শেষ করা যায়।",
    attributes: {
      author: "ঝংকার মাহবুব (Jhankar Mahbub)",
      publisher: "আদর্শ প্রকাশনী (Adarsha)",
      edition: "নতুন সংস্করণ (Latest Edition)",
      publicationYear: "২০২৪ (2024)",
      language: "বাংলা (Bangla)",
      coverType: "পেপারব্যাক (Paperback)",
      numberOfPages: "২০৮",
      isbn: "978-984-927-440-4",
      genre: "আত্মউন্নয়ন ও মোটিভেশন (Self-Help)",
      paperType: "হোয়াইট প্রিন্ট (White Print)",
      bookWeight: "280 গ্রাম",
      countryOfOrigin: "বাংলাদেশ (Bangladesh)",
      origin: "বাংলাদেশ (Bangladesh)",
    },
  },

  // =========================================================================
  // 4. BOOK: শঙ্খনীল কারাগার - হুমায়ূন আহমেদ
  // =========================================================================
  {
    title: "শঙ্খনীল কারাগার - হুমায়ূন আহমেদ (বাংলা সাহিত্যের কালজয়ী পারিবারিক উপন্যাস)",
    sku: "BOOK-HUM-SHANKHO-001",
    slug: "shankhonil-karagar-humayun-ahmed",
    shortDescription:
      "হুমায়ূন আহমেদের প্রথম উপন্যাস, যা বাংলা কথাসাহিত্যে এক বিপ্লব সৃষ্টি করেছিল। মধ্যবিত্ত পরিবারের টানাপোড়েন, নিঃশব্দ ভালোবাসা আর আত্মত্যাগের হৃদয়স্পর্শী উপাখ্যান।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">উপন্যাস পরিচিতি:</h3>
  <p>
    <strong>শঙ্খনীল কারাগার</strong> হুমায়ূন আহমেদের প্রথম প্রকাশিত কালজয়ী উপন্যাস। একটি মধ্যবিত্ত পরিবারের সুখ-দুঃখ, ভাই-বোনের গভীর মমতা আর জীবনের অপ্রকাশিত বিষাদকে লেখক এত জীবন্তভাবে চিত্রিত করেছেন যে প্রতি পৃষ্ঠায় পাঠকের চোখ ভিজে আসে।
  </p>
  <p>
    রাবেয়া, খোকা, মন্টু, রুনু আর ছোট বোন খুকুর সাধারণ জীবনের অসাধারণ অনুভূতিগুলো বাংলা সাহিত্যের অমূল্য সম্পদ। পরবর্তীতে এই উপন্যাসের ওপর ভিত্তি করে নির্মিত চলচ্চিত্র জাতীয় চলচ্চিত্র পুরস্কার অর্জন করে।
  </p>
</div>
    `,
    stockQuantity: 150,
    categorySlugOrName: "Fiction Books",
    regularPrice: 240,
    salePrice: 190,
    flashSalePrice: 175,
    images: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 5.0,
    reviewsCount: 410,
    unitsSold: 2150,
    reviewSnippet: "বাংলা সাহিত্যের শ্রেষ্ঠতম উপন্যাসগুলোর একটি। যতবার পড়ি ততবারই নতুন করে মুগ্ধ হই।",
    attributes: {
      author: "হুমায়ূন আহমেদ (Humayun Ahmed)",
      publisher: "খান ব্রাদার্স অ্যান্ড কোম্পানি (Khan Brothers)",
      edition: "বিশেষ সংস্করণ (Special Edition)",
      publicationYear: "২০২৪ (2024)",
      language: "বাংলা (Bangla)",
      coverType: "হার্ডকভার (Hardcover)",
      numberOfPages: "১১২",
      isbn: "978-984-408-012-6",
      genre: "উপন্যাস (Novel)",
      paperType: "অফসেট পেপার (Offset Paper)",
      bookWeight: "220 গ্রাম",
      countryOfOrigin: "বাংলাদেশ (Bangladesh)",
      origin: "বাংলাদেশ (Bangladesh)",
    },
  },

  // =========================================================================
  // 5. BOOK: অ্যাটমিক হ্যাবিটস (বাংলা অনুবাদ) - জেমস ক্লিয়ার
  // =========================================================================
  {
    title: "অ্যাটমিক হ্যাবিটস (বাংলা অনুবাদ) - জেমস ক্লিয়ার | Atomic Habits Bangla by James Clear",
    sku: "BOOK-JMC-ATOMIC-001",
    slug: "atomic-habits-bangla-translation-james-clear",
    shortDescription:
      "বিশ্বব্যাপী কোটি পাঠকের জীবন বদলে দেওয়া নাম্বার ১ নিউইয়র্ক টাইমস বেস্টসেলার বইয়ের সাবলীল ও চমৎকার বাংলা অনুবাদ। প্রতিদিন মাত্র ১% পরিবর্তনের অবিশ্বাস্য শক্তি।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">বইয়ের মূল বার্তা:</h3>
  <p>
    খারাপ অভ্যাস ভাঙা এবং ভালো অভ্যাস গড়ে তোলার বৈজ্ঞানিক ও পরীক্ষিত ফর্মুলা নিয়ে জেমস ক্লিয়ারের যুগান্তকারী বই <strong>'অ্যাটমিক হ্যাবিটস'</strong>। বড় কোনো পরিবর্তন রাতারাতি আসে না, বরং প্রতিদিনের অতি ক্ষুদ্র ক্ষুদ্র ১% ইতিবাচক অভ্যাস চক্রবৃদ্ধি হারে জীবনে আমূল পরিবর্তন আনে।
  </p>
  <div class="grid grid-cols-2 gap-2 text-xs font-medium text-slate-700">
    <div class="bg-slate-50 p-2.5 rounded-lg border">১. অভ্যাসকে স্পষ্ট ও সহজ করা</div>
    <div class="bg-slate-50 p-2.5 rounded-lg border">২. অভ্যাসকে আকর্ষণীয় বানানো</div>
    <div class="bg-slate-50 p-2.5 rounded-lg border">৩. পরিবেশ ও ট্রিগার নিয়ন্ত্রণ</div>
    <div class="bg-slate-50 p-2.5 rounded-lg border">৪. ফলাফলকে তৃপ্তিদায়ক করা</div>
  </div>
</div>
    `,
    stockQuantity: 180,
    categorySlugOrName: "Non-Fiction Books",
    regularPrice: 450,
    salePrice: 360,
    flashSalePrice: 320,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 340,
    unitsSold: 1850,
    reviewSnippet: "অনুবাদ অত্যন্ত সাবলীল ও সহজবোধ্য। নিজের জীবনকে নিয়মশৃঙ্খলায় নিয়ে আসার অসাধারণ পথপ্রদর্শক।",
    attributes: {
      author: "জেমস ক্লিয়ার (James Clear)",
      translator: "আল-আমিন আহমেদ (অনুবাদক)",
      publisher: "বাতিঘর (Batighar)",
      edition: "১ম সংস্করণ (1st Edition)",
      publicationYear: "২০২৪ (2024)",
      language: "বাংলা (Bangla)",
      coverType: "হার্ডকভার (Hardcover)",
      numberOfPages: "৩২০",
      isbn: "978-984-882-510-7",
      genre: "আত্মউন্নয়ন ও মোটিভেশন (Self-Help)",
      paperType: "৮৫ জিএসএম প্রিমিয়াম পেপার (85 GSM Premium)",
      bookWeight: "450 গ্রাম",
      countryOfOrigin: "বাংলাদেশ (Bangladesh)",
      origin: "বাংলাদেশ (Bangladesh)",
    },
  },

  // =========================================================================
  // 6. STATIONERY: ম্যাটাডোর পিন-পয়েন্ট ০.৫ মিমি বলপেন (২০ পিসের সম্পূর্ণ বক্স)
  // =========================================================================
  {
    title: "ম্যাটাডোর পিন-পয়েন্ট ০.৫ মিমি স্মুথ জেল-ফিল বলপেন (২০ পিসের সম্পূর্ণ বক্স - নীল কালি)",
    sku: "STAT-MAT-PINPT-BOX20",
    slug: "matador-pin-point-0-5mm-ball-pen-box-of-20",
    shortDescription:
      "বাংলাদেশের সর্বাধিক জনপ্রিয় ও বিশ্বাসযোগ্য বলপেন। ০.৫ মিমি সুইস টিপ ও অয়েল জেল বেসড তেলমুক্ত কালি যা দীর্ঘক্ষণ একটানা স্মুথ হ্যান্ডরাইটিং নিশ্চিত করে।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">পণ্য বৈশিষ্ট্য ও বিস্তারিত:</h3>
  <p>
    <strong>Matador Pin-Point 0.5 mm</strong> দেশের শিক্ষার্থী, শিক্ষক এবং অফিস কর্মীদের প্রথম পছন্দ। এর বিশেষ ম্যাট-গ্রিপ বডি আঙুলে ক্লান্তি দূর করে এবং নিখুঁত হস্তাক্ষরে সাহায্য করে।
  </p>
  <ul class="list-disc pl-5 text-xs text-slate-600 space-y-1">
    <li>নিখুঁত 0.5 mm ফাইন নিডল টিপ</li>
    <li>দ্রুত শুকানো ও দাগহীন হাই-ফ্লো কালি</li>
    <li>আকর্ষণীয় ও আরামদায়ক ট্রায়াঙ্গুলার শেপড গ্রিপ</li>
    <li>প্রতিটি বক্সে ২০টি প্রিমিয়াম পিন-পয়েন্ট পেন</li>
  </ul>
</div>
    `,
    stockQuantity: 300,
    categorySlugOrName: "Stationery",
    regularPrice: 200,
    salePrice: 175,
    flashSalePrice: 159,
    images: [
      "https://images.unsplash.com/photo-1585336261026-775c6dd5ccf6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 460,
    unitsSold: 2800,
    reviewSnippet: "একদম জেনুইন ম্যাটাডোর পেন। লেখার ফ্লো খুবই স্মুথ, কোনো কালি ছড়ায় না।",
    attributes: {
      itemType: "বলপেন / জেল পেন (Ball & Gel Pen)",
      brand: "ম্যাটাডোর (Matador)",
      packSize: "১ বক্স / ২০ পিস (Box of 20)",
      inkColor: "নীল (Blue)",
      material: "প্লাস্টিক ও নিকেল-সিলভার টিপ (Plastic & Nickel Tip)",
      dimensions: "0.5 mm Fine Needle Tip",
      warranty: "কোনো ওয়ারেন্টি নেই (No Warranty)",
      countryOfOrigin: "বাংলাদেশ (Bangladesh)",
      origin: "বাংলাদেশ (Bangladesh)",
      customSpecs: [
        { id: "cs1", label: "টিপ প্রযুক্তি", value: "Swiss Needle Point 0.5mm" },
        { id: "cs2", label: "কালি ধরণ", value: "Oil Gel Smudge-Free Ink" },
      ],
    },
  },

  // =========================================================================
  // 7. STATIONERY: Casio FX-991CW ClassWiz Scientific Calculator
  // =========================================================================
  {
    title: "ক্যাসিও এফএক্স-৯৯১সিডব্লিউ অরিজিনাল নন-প্রোগ্রামেবল সায়েন্টিফিক ক্যালকুলেটর (Casio FX-991CW ClassWiz)",
    sku: "STAT-CAS-FX991CW-001",
    slug: "casio-fx-991cw-classwiz-scientific-calculator",
    shortDescription:
      "এসএসসি, এইচএসসি ও ইঞ্জিনিয়ারিং শিক্ষার্থীদের জন্য অনুমোদিত ক্যাসিওর লেটেস্ট ফ্ল্যাগশিপ সায়েন্টিফিক ক্যালকুলেটর। ৫৪০+ গাণিতিক ফাংশন এবং ন্যাচারাল টেক্সটবুক হাই-রেজোলিউশন ডিসপ্লে।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">পণ্যের মূল সুবিধাসমূহ:</h3>
  <p>
    <strong>Casio FX-991CW</strong> হলো ক্যাসিওর বিশ্ববিখ্যাত ClassWiz সিরিজের সর্বশেষ সংস্করণ। এর আধুনিক কি-প্যাড এবং চার-গ্রে-স্কেল হাই-রেজোলিউশন এলসিডি স্ক্রিন জটিল সমীকরণ, ম্যাট্রিক্স, ক্যালকুলাস, ও পরিসংখ্যান সমাধানকে করে তোলে অত্যন্ত সহজ।
  </p>
  <div class="rounded-xl bg-slate-50 border p-3.5 space-y-1 text-xs">
    <div class="font-bold text-slate-800">✅ প্রধান স্পেসিফিকেশন:</div>
    <div>• ৫৪০ টিরও বেশি বৈজ্ঞানিক ফাংশন (540+ Advanced Functions)</div>
    <div>• সোলার ও ব্যাটারি ডুয়াল পাওয়ার (Solar + LR44 Battery)</div>
    <div>• ৩ বছরের অফিসিয়াল ওয়ারেন্টি ও আসল প্রোডাক্ট যাচাইয়ের জন্য QR কোড স্টিকার</div>
    <div>• টেক্সটবুক ভিউ: ভগ্নাংশ ও রুট বইয়ের মতোই পর্দায় প্রদর্শিত হয়</div>
  </div>
</div>
    `,
    stockQuantity: 80,
    categorySlugOrName: "Stationery",
    regularPrice: 2850,
    salePrice: 2450,
    flashSalePrice: 2299,
    images: [
      "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 5.0,
    reviewsCount: 310,
    unitsSold: 950,
    reviewSnippet: "১০০% অরিজিনাল ক্যাসিও ক্যালকুলেটর। অফিসিয়াল ওয়ারেন্টি কার্ড সহ পেয়েছি। ডিসপ্লে অসাধারণ স্পষ্ট!",
    attributes: {
      itemType: "সায়েন্টিফিক ক্যালকুলেটর (Calculator)",
      brand: "ক্যাসিও (Casio)",
      packSize: "১ পিস (Single Pc with Hard Case)",
      material: "প্লাস্টিক ও মেটাল কিপ্যাড (High Grade Plastic)",
      dimensions: "162 × 77 × 10.7 mm",
      warranty: "৩ বছরের অফিসিয়াল ওয়ারেন্টি (3 Years)",
      countryOfOrigin: "থাইল্যান্ড (Thailand)",
      origin: "থাইল্যান্ড (Thailand)",
      customSpecs: [
        { id: "cs1", label: "ফাংশন সংখ্যা", value: "৫৪০+ এডভান্সড ফাংশন" },
        { id: "cs2", label: "পাওয়ার সোর্স", value: "Two-Way Power (Solar + Battery)" },
        { id: "cs3", label: "ডিসপ্লে", value: "High Definition 4-Gradation LCD" },
      ],
    },
  },

  // =========================================================================
  // 8. STATIONERY: বসুন্ধরা ৮০ জিএসএম প্রিমিয়াম এ৪ ফটোকপি পেপার রিম
  // =========================================================================
  {
    title: "বসুন্ধরা ৮০ জিএসএম প্রিমিয়াম এ৪ সাইজ মাল্টিপারপাস ফটোকপি ও প্রিন্টিং পেপার রিম (৫০০ শিট)",
    sku: "STAT-BSH-A4-80GSM-500",
    slug: "bashundhara-80gsm-a4-photocopy-paper-ream-500",
    shortDescription:
      "১০০% খাঁটি ভার্জিন পাল্পে তৈরি উচ্চ শুভ্রতার প্রিমিয়াম এ৪ ফটোকপি ও প্রিন্ট পেপার। লেজার, ইঙ্কজেট ও উভয় পিঠে জ্যামহীন মসৃণ প্রিন্টিংয়ের জন্য সেরা পেপার।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">পেপার ফিচার ও গুণমান:</h3>
  <p>
    <strong>Bashundhara 80 GSM A4 Paper</strong> অফিসের গুরুত্বপূর্ণ ডকুমেন্ট, থিসিস পেপার, লিগ্যাল ড্রাফট ও প্রজেক্ট প্রিন্টিংয়ের জন্য আদর্শ পেপার রিম। এর অপাসিটি চমৎকার হওয়ায় দুই পিঠেই স্পষ্ট ও কালিমুক্ত প্রিন্ট সম্ভব।
  </p>
  <ul class="list-disc pl-5 text-xs text-slate-600 space-y-1">
    <li>৮০ জিএসএম (80 GSM) ভারী ও প্রিমিয়াম পুরুত্ব</li>
    <li>৯৮% উজ্জ্বলতা (Ultra White Brightness)</li>
    <li>হাই-স্পিড প্রিন্টারে কোনো জ্যামিং হয় না</li>
    <li>প্রতিটি রিমে সম্পূর্ণ ৫০০টি নিখুঁত কাটা শিট</li>
  </ul>
</div>
    `,
    stockQuantity: 400,
    categorySlugOrName: "Stationery",
    regularPrice: 520,
    salePrice: 460,
    flashSalePrice: 425,
    images: [
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 190,
    unitsSold: 3400,
    reviewSnippet: "অফিসের কাজের জন্য নিয়মিত কিনি। কাগজের পুরুত্ব চমৎকার, প্রিন্টারে কখনো বাঁধে না।",
    attributes: {
      itemType: "প্রিন্ট পেপার ও শিট (A4 & Offset Paper)",
      brand: "বসুন্ধরা পেপার (Bashundhara)",
      packSize: "১ রিম / ৫০০ শিট (Ream of 500 Sheets)",
      paperGsm: "80 GSM (প্রিমিয়াম নোটবুক/অফিস পেপার)",
      dimensions: "A4 Size (210 × 297 mm)",
      material: "কাগজ / পেপারবোর্ড (Paper / Board)",
      countryOfOrigin: "বাংলাদেশ (Bangladesh)",
      origin: "বাংলাদেশ (Bangladesh)",
      customSpecs: [
        { id: "cs1", label: "উজ্জ্বলতা", value: "98% Ultra White" },
        { id: "cs2", label: "শিট সংখ্যা", value: "500 Sheets Exact" },
      ],
    },
  },

  // =========================================================================
  // 9. STATIONERY: Deli Heavy Duty Metal Desktop Stapler Combo
  // =========================================================================
  {
    title: "ডেলি হেভি ডিউটি অল-মেটাল ডেস্কটপ স্ট্যাপলার ও ১০০০ পিস পিন কম্বো সেট (Deli Metal Stapler Combo)",
    sku: "STAT-DELI-STP-0238",
    slug: "deli-heavy-duty-metal-desktop-stapler-combo",
    shortDescription:
      "দীর্ঘস্থায়ী অল-মেটাল বডি ও সফট রাবার গ্রিপযুক্ত প্রফেশনাল ডেস্কটপ স্ট্যাপলার। ২৫ পৃষ্ঠা পর্যন্ত একসাথে সহজে স্ট্যাপল করার ক্ষমতা এবং বিনামূল্যে ১০০০ পিস ২৪/৬ পিন অন্তর্ভুক্ত।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">প্রোডাক্ট ওভারভিউ:</h3>
  <p>
    <strong>Deli Heavy-Duty Metal Stapler Set</strong> অফিস, ব্যাংক ও শিক্ষা প্রতিষ্ঠানে প্রতিদিনের ফাইল ম্যানেজমেন্টের বিশ্বস্ত সঙ্গী। মজবুত স্টিল ফ্রেম এবং স্মুথ প্রেস মেকানিজম থাকায় হাতের চাপ কম লাগে এবং পিন কখনো বাঁকা হয় না।
  </p>
  <ul class="list-disc pl-5 text-xs text-slate-600 space-y-1">
    <li>একসাথে ২৫টি কাগজ নিখুঁতভাবে স্ট্যাপল করার ক্ষমতা</li>
    <li>রোট্যাটিং অ্যানভিল (পার্মানেন্ট ও পিন-টাইপ অস্থায়ী দুইভাবেই স্ট্যাপল করা যায়)</li>
    <li>সাথে রয়েছে ১০০০ পিস ডেলি হাই-কোয়ালিটি ২৪/৬ স্ট্যান্ডার্ড পিন</li>
  </ul>
</div>
    `,
    stockQuantity: 110,
    categorySlugOrName: "Stationery",
    regularPrice: 380,
    salePrice: 310,
    flashSalePrice: 279,
    images: [
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1585336261026-775c6dd5ccf6?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.7,
    reviewsCount: 140,
    unitsSold: 670,
    reviewSnippet: "মেটালের বডি খুব ভারী ও মজবুত। পিন আটকে থাকে না, চমৎকার পারফরম্যান্স।",
    attributes: {
      itemType: "স্ট্যাপলার ও পিন (Stapler & Pins)",
      brand: "ডেলি (Deli)",
      packSize: "কমপ্লিট সেট (১ স্ট্যাপলার + ১০০০ পিন)",
      material: "মেটাল / স্টিল (Metal / Steel)",
      inkColor: "কালো (Black)",
      dimensions: "125 × 40 × 55 mm",
      warranty: "১ বছরের অফিসিয়াল ওয়ারেন্টি (1 Year)",
      countryOfOrigin: "চীন (China)",
      origin: "চীন (China)",
      customSpecs: [
        { id: "cs1", label: "স্ট্যাপলিং ক্ষমতা", value: "25 Sheets (80 GSM Paper)" },
        { id: "cs2", label: "পিন সাইজ", value: "24/6 & 26/6 Compatible" },
      ],
    },
  },

  // =========================================================================
  // 10. STATIONERY: Faber-Castell 24 Classic Colour Pencils
  // =========================================================================
  {
    title: "ফ্যাবার-ক্যাসেল ২৪ ক্লাসিক ট্রায়াঙ্গুলার কালার পেন্সিল সেট (Faber-Castell 24 Classic Colour Pencils)",
    sku: "STAT-FBC-COLOR-24T",
    slug: "faber-castell-24-classic-colour-pencils-set",
    shortDescription:
      "শিশুদের ড্রয়িং ও শিক্ষার্থীদের ফাইন আর্টসের জন্য বিশ্ববিখ্যাত জার্মান ব্র্যান্ড ফ্যাবার-ক্যাসেলের ২৪ টি উজ্জ্বল ও মসৃণ কালার পেন্সিল সেট। এসভি বন্ডিং প্রযুক্তির কারণে লিড সহজে ভাঙে না।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">আর্ট ও কালারিং অভিজ্ঞতা:</h3>
  <p>
    <strong>Faber-Castell Classic 24 Colour Pencils</strong> এর ত্রিকোণাকৃতির (Triangular) গ্রিপ শিশুদের হাতকে সঠিক পেন্সিল গ্রিপ শিখতে সাহায্য করে। এর প্রিমিয়াম পিগমেন্ট কাগজের বুকে মসৃণভাবে মিশে গিয়ে জীবন্ত ও আকর্ষণীয় রঙ ফুটিয়ে তোলে।
  </p>
  <ul class="list-disc pl-5 text-xs text-slate-600 space-y-1">
    <li>২৪ টি সমৃদ্ধ ও উজ্জ্বল রঙের বৈচিত্র্য</li>
    <li>SV Bonding প্রযুক্তি যা শার্প করার সময় বা হাত থেকে পড়লে লিড ভাঙতে দেয় না</li>
    <li>১০০% বিষাক্ততামুক্ত (Non-toxic) এবং শিশুদের জন্য সম্পূর্ণ নিরাপদ</li>
    <li>পরিবেশবান্ধব ও পুনঃরোপণযোগ্য বন থেকে সংগৃহীত কাঠে নির্মিত</li>
  </ul>
</div>
    `,
    stockQuantity: 140,
    categorySlugOrName: "Stationery",
    regularPrice: 420,
    salePrice: 350,
    flashSalePrice: 315,
    images: [
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1585336261026-775c6dd5ccf6?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 280,
    unitsSold: 1120,
    reviewSnippet: "বাচ্চাদের ড্রয়িংয়ের জন্য সেরা কালার পেন্সিল। শেডগুলো অনেক ব্রাইট ও সহজে ভাঙে না।",
    attributes: {
      itemType: "কালার ও আর্ট সামগ্রী (Color & Art Supplies)",
      brand: "ফ্যাবার-ক্যাসেল (Faber-Castell)",
      packSize: "১ বক্স / ২৪ কালার সেট",
      inkColor: "মাল্টিকালার / বিভিন্ন রঙ (Assorted / Multicolor)",
      material: "পরিবেশবান্ধব সার্টিফাইড কাঠ (Eco Wood)",
      dimensions: "3.3 mm Break-Resistant Lead",
      countryOfOrigin: "জার্মানি (Germany)",
      origin: "জার্মানি (Germany)",
      customSpecs: [
        { id: "cs1", label: "লিড প্রযুক্তি", value: "Secural SV Bonded (Break Resistant)" },
        { id: "cs2", label: "নিরাপত্তা সনদ", value: "Non-Toxic Child Safe Certification" },
      ],
    },
  },
];

async function main() {
  console.log("🚀 Starting Seeding of 5 Books & 5 Stationery Products...");

  // 1. Find a valid vendor
  const vendor = await prisma.vendor.findFirst();
  if (!vendor) {
    throw new Error("No vendor found in the database. Please register a vendor first.");
  }
  console.log(`👤 Using Vendor: ${vendor.storeName || vendor.name} (${vendor.id})`);

  // 2. Fetch categories
  const allCategories = await prisma.category.findMany();

  // Flash sale timer boundaries
  const flashSaleStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const flashSaleEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // New arrivals timer boundaries
  const newArrivalStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newArrivalEnd = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < productsToSeed.length; i++) {
    const item = productsToSeed[i];

    // Find category
    let targetCat = allCategories.find(
      (c) =>
        c.name.toLowerCase() === item.categorySlugOrName.toLowerCase() ||
        c.slug.toLowerCase().includes(item.categorySlugOrName.toLowerCase())
    );

    if (!targetCat) {
      targetCat = allCategories.find(
        (c) =>
          c.name.toLowerCase().includes("book") ||
          c.name.toLowerCase().includes("stationery")
      );
    }

    if (!targetCat) {
      throw new Error(`Category not found for: ${item.categorySlugOrName}`);
    }

    const finalCategoryId = targetCat.id;

    // Check if product exists by SKU or Slug
    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ sku: item.sku }, { slug: item.slug }],
      },
    });

    if (existing) {
      console.log(`🔄 Updating existing product: ${item.title}`);
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          title: item.title,
          shortDescription: item.shortDescription,
          description: item.descriptionHtml.trim(),
          stockQuantity: item.stockQuantity,
          images: item.images,
          categoryId: finalCategoryId,
          attributes: item.attributes as any,
          pricing: {
            upsert: {
              create: {
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
            },
          },
          flashSaleAttribute: {
            upsert: {
              create: {
                flashSalePrice: item.flashSalePrice,
                flashSaleStock: Math.round(item.stockQuantity * 0.5),
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
            },
          },
          topRatedAttribute: {
            upsert: {
              create: {
                averageRating: item.rating,
                totalReviews: item.reviewsCount,
                reviewSnippet: item.reviewSnippet,
              },
              update: {
                averageRating: item.rating,
                totalReviews: item.reviewsCount,
                reviewSnippet: item.reviewSnippet,
              },
            },
          },
          topSellerAttribute: {
            upsert: {
              create: {
                unitsSold: item.unitsSold,
                salesBadge: "Best Seller",
                isExpressEligible: true,
              },
              update: {
                unitsSold: item.unitsSold,
                salesBadge: "Best Seller",
              },
            },
          },
          featuredAttribute: {
            upsert: {
              create: {
                featuredBadgeText: i < 5 ? "রকমারি চয়েস" : "বেস্ট স্টেশনারি",
                bannerImage: item.images[0],
                displayOrder: i + 1,
              },
              update: {
                featuredBadgeText: i < 5 ? "রকমারি চয়েস" : "বেস্ট স্টেশনারি",
                bannerImage: item.images[0],
              },
            },
          },
          newArrivalAttribute: {
            upsert: {
              create: {
                badgeText: "New Arrival",
                displayOrder: i + 1,
                startDate: newArrivalStart,
                endDate: newArrivalEnd,
              },
              update: {
                badgeText: "New Arrival",
                startDate: newArrivalStart,
                endDate: newArrivalEnd,
              },
            },
          },
        },
      });
      console.log(`✅ Updated: ${item.title}`);
    } else {
      console.log(`✨ Creating product: ${item.title}`);
      const newProduct = await prisma.product.create({
        data: {
          title: item.title,
          sku: item.sku,
          slug: item.slug,
          shortDescription: item.shortDescription,
          description: item.descriptionHtml.trim(),
          stockQuantity: item.stockQuantity,
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
              flashSaleStock: Math.round(item.stockQuantity * 0.5),
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
              reviewSnippet: item.reviewSnippet,
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
              featuredBadgeText: i < 5 ? "রকমারি চয়েস" : "বেস্ট স্টেশনারি",
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
      console.log(`✅ Created Product: ${newProduct.title} (ID: ${newProduct.id})`);
    }
  }

  console.log("🎉 Successfully seeded 5 Books and 5 Stationery Products!");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
