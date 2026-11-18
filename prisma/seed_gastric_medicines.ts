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
  // 1. Seclo 20 mg Capsule (Square Pharmaceuticals) - পাতা (1 Strip of 10)
  // =========================================================================
  {
    title: "সেকলো ২০ মি.গ্রা. ক্যাপসুল (ওমিপ্রাজল) - স্কয়ার | Seclo 20 mg Capsule (Omeprazole)",
    sku: "MED-SEC-20-CAP-001",
    slug: "seclo-20mg-capsule-omeprazole-square-001",
    shortDescription:
      "স্কয়ার ফার্মাসিউটিক্যালসের বহুল ব্যবহৃত গ্যাস্ট্রিক ও এসিডিটি নিরাময়ের ক্যাপসুল। পেটের অতিরিক্ত অ্যাসিড উৎপাদন নিয়ন্ত্রণে অত্যন্ত কার্যকর।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">ওষুধ পরিচিতি ও বিবরণ:</h3>
  <p>
    <strong>সেকলো ২০ মি.গ্রা. (Seclo 20 mg)</strong> ওমিপ্রাজল গ্রুপের অন্যতম জনপ্রিয় প্রোটন পাম্প ইনহিবিটর (PPI)। এটি পাকস্থলীর প্যারাইটাল কোষ থেকে অতিরিক্ত হাইড্রোক্লোরিক অ্যাসিড নিঃসরণ কার্যকরভাবে বাধাগ্রস্ত করে গ্যাস্ট্রিক আলসার, ডিওডেনাল আলসার, গ্যাস্ট্রোইসোফেজিয়াল রিফ্লাক্স (GERD) এবং অতিরিক্ত বুক জ্বালাপোড়া দ্রুত উপশম করে।
  </p>
  <div class="my-4 rounded-xl bg-emerald-50/70 p-4 border border-emerald-200">
    <h4 class="font-bold text-emerald-900 text-sm mb-1">মূল বৈশিষ্ট্য ও গুণাগুণ:</h4>
    <ul class="list-disc pl-5 text-xs text-emerald-800 space-y-1">
      <li>প্রতিটি ক্যাপসুলে রয়েছে ২০ মি.গ্রা. এন্টারিক-কোটেড ওমিপ্রাজল পেলেটস</li>
      <li>স্কয়ার ফার্মাসিউটিক্যালসের সর্বোচ্চ ফার্মাসিউটিক্যাল মান ও DGDA অনুমোদিত</li>
      <li>অ্যাসিড নিঃসরণ ২৪ ঘণ্টা পর্যন্ত নিয়ন্ত্রণে রাখে</li>
      <li>১০টি ক্যাপসুলের আর্দ্রতারোধক অ্যালু-অ্যালু ফয়েল স্ট্রিপ (পাতা)</li>
    </ul>
  </div>
  <p>
    <strong>সেবনবিধি:</strong> প্রতিদিন সকালে বা রাতে খাবারের ৩০ মিনিট পূর্বে ১টি ক্যাপসুল এক গ্লাস পানির সাথে সেব্য।
  </p>
</div>
`,
    stockQuantity: 500,
    categorySlugOrName: "OTC Medicine",
    regularPrice: 70,
    salePrice: 65,
    flashSalePrice: 58,
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 312,
    unitsSold: 2450,
    reviewSnippet: "গ্যাস্ট্রিকের জন্য সবচেয়ে নির্ভরযোগ্য ক্যাপসুল। দ্রুত বুক জ্বালাপোড়া কমে যায়।",
    attributes: {
      genericName: "Omeprazole (ওমিপ্রাজল)",
      manufacturer: "Square Pharmaceuticals Ltd. (স্কয়ার)",
      dosageForm: "ক্যাপসুল (Capsule)",
      strength: "20 mg",
      packSize: "১০টি ক্যাপসুলের পাতা (1 Strip of 10)",
      prescriptionRequired: "OTC (প্রেসক্রিপশন ছাড়া কেনা যাবে / Over-The-Counter)",
      darNo: "DAR: 025-104-065",
      indications: "গ্যাস্ট্রিক, আলসার ও এসিডিটি (Acidity & Gastric)",
      storageCondition: "৩০° সে. এর নিচে, শুষ্ক ও আলো থেকে দূরে রাখুন",
      expiryDate: "৩ বছর (3 Years Shelf Life)",
      sideEffectsWarnings: "খাওয়ার ৩০ মিনিট পূর্বে সেব্য (Take 30 mins before meal)",
      countryOfOrigin: "বাংলাদেশ (Bangladesh)",
      customSpecs: [
        { id: "spec_1", label: "থেরাপিউটিক ক্লাস", value: "Proton Pump Inhibitor (PPI)" },
        { id: "spec_2", label: "প্যাকেজিং ধরণ", value: "অ্যালু-অ্যালু ব্লিস্টার ফয়েল প্যাক" },
      ],
    },
  },

  // =========================================================================
  // 2. Sergel 20 mg Tablet (Healthcare Pharmaceuticals) - পাতা (1 Strip of 10)
  // =========================================================================
  {
    title: "সারজেল ২০ মি.গ্রা. ট্যাবলেট (ইসোমিপ্রাজল) - হেলথকেয়ার | Sergel 20 mg Tablet (Esomeprazole)",
    sku: "MED-SER-20-TAB-002",
    slug: "sergel-20mg-tablet-esomeprazole-healthcare-002",
    shortDescription:
      "হেলথকেয়ার ফার্মাসিউটিক্যালসের নেক্সট-জেনারেশন এসোমিপ্রাজল ট্যাবলেট। তীব্র এসিডিটি ও অ্যাসিড রিফ্লাক্সে দীর্ঘস্থায়ী আরাম প্রদান করে।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">ওষুধ পরিচিতি ও বিবরণ:</h3>
  <p>
    <strong>সারজেল ২০ মি.গ্রা. (Sergel 20 mg)</strong> এস-আইসোমার ওমিপ্রাজল (Esomeprazole Magnesium Trihydrate) ধারণকারী আধুনিক অ্যাসিড রিডিউসার। এটি সাধারণ অ্যান্টাসিড বা প্রচলিত ওষুধের চেয়ে দীর্ঘস্থায়ীভাবে পাকস্থলীর অতিরিক্ত এসিডিটি নিয়ন্ত্রণ করে খাদ্যনালীর ক্ষত ও আলসার নিরাময়ে কাজ করে।
  </p>
  <div class="my-4 rounded-xl bg-blue-50/70 p-4 border border-blue-200">
    <h4 class="font-bold text-blue-900 text-sm mb-1">মূল বৈশিষ্ট্য ও গুণাগুণ:</h4>
    <ul class="list-disc pl-5 text-xs text-blue-800 space-y-1">
      <li>উন্নত বায়োঅ্যাভেইলেবিলিটি সম্পন্ন এসোমিপ্রাজল ২০ মি.গ্রা.</li>
      <li>হেলথকেয়ার ফার্মাসিউটিক্যালসের ইউএস এফডিএ সমমান স্ট্যান্ডার্ড</li>
      <li>বুক জ্বালাপোড়া ও টক ঢেঁকুর ওঠা থেকে দ্রুত স্বস্তি</li>
      <li>সহজে গিলে ফেলা যায় এমন ফিল্ম-কোটেড ট্যাবলেট</li>
    </ul>
  </div>
  <p>
    <strong>সেবনবিধি:</strong> খাবারের ৩০ মিনিট পূর্বে ১টি ট্যাবলেট সেবন করতে হবে।
  </p>
</div>
`,
    stockQuantity: 450,
    categorySlugOrName: "OTC Medicine",
    regularPrice: 80,
    salePrice: 75,
    flashSalePrice: 68,
    images: [
      "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 245,
    unitsSold: 1980,
    reviewSnippet: "বুক জ্বালাপোড়া দূর করতে সারজেল চমৎকার কাজ করে। কোয়ালিটি অত্যন্ত ভালো।",
    attributes: {
      genericName: "Esomeprazole (ইসোমিপ্রাজল)",
      manufacturer: "Healthcare Pharmaceuticals Ltd. (হেলথকেয়ার)",
      dosageForm: "ট্যাবলেট (Tablet)",
      strength: "20 mg",
      packSize: "১০টি ট্যাবলেটের পাতা (1 Strip of 10)",
      prescriptionRequired: "OTC (প্রেসক্রিপশন ছাড়া কেনা যাবে / Over-The-Counter)",
      darNo: "DAR: 221-118-052",
      indications: "গ্যাস্ট্রিক, আলসার ও এসিডিটি (Acidity & Gastric)",
      storageCondition: "৩০° সে. এর নিচে, শুষ্ক ও আলো থেকে দূরে রাখুন",
      expiryDate: "৩ বছর (3 Years Shelf Life)",
      sideEffectsWarnings: "খাওয়ার ৩০ মিনিট পূর্বে সেব্য (Take 30 mins before meal)",
      countryOfOrigin: "বাংলাদেশ (Bangladesh)",
      customSpecs: [
        { id: "spec_1", label: "থেরাপিউটিক ক্লাস", value: "Next-Gen PPI (Acid Reducer)" },
        { id: "spec_2", label: "ট্যাবলেট টাইপ", value: "ফিল্ম কোটেড ট্যাবলেট" },
      ],
    },
  },

  // =========================================================================
  // 3. Antacid Plus Liquid Suspension 200 ml Bottle (Square) - বোতল (200 ml)
  // =========================================================================
  {
    title: "অ্যান্টাসিড প্লাস সাসপেনশন ২০০ মিলি বোতল - স্কয়ার | Antacid Plus Liquid Suspension 200 ml Bottle",
    sku: "MED-ANT-PLUS-200ML-003",
    slug: "antacid-plus-suspension-200ml-bottle-square-003",
    shortDescription:
      "স্কয়ার ফার্মার রিফ্রেশিং কুলিং পুদিনা স্বাদের লিকুইড সাসপেনশন বোতল। মাত্র ২ মিনিটে পেটের গ্যাস, ফাঁপা ভাব ও বুক জ্বালাপোড়া প্রশমিত করে।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">ওষুধ পরিচিতি ও বিবরণ:</h3>
  <p>
    <strong>অ্যান্টাসিড প্লাস সাসপেনশন (Antacid Plus Liquid)</strong> একটি সুষম কম্বিনেশন এন্টাসিড, যাতে রয়েছে অ্যালুমিনিয়াম হাইড্রোক্সাইড, ম্যাগনেসিয়াম হাইড্রোক্সাইড এবং পেট ফাঁপা দূরকারী সিমিথিকোন। এটি অতিরিক্ত অ্যাসিডকে নিউট্রিলাইজ করে পাকস্থলীতে প্রশান্তিদায়ক আবরণ তৈরি করে।
  </p>
  <div class="my-4 rounded-xl bg-teal-50/70 p-4 border border-teal-200">
    <h4 class="font-bold text-teal-900 text-sm mb-1">মূল বৈশিষ্ট্য ও গুণাগুণ:</h4>
    <ul class="list-disc pl-5 text-xs text-teal-800 space-y-1">
      <li>২০০ মিলি সিল করা কাঁচের বোতল যাতে সুনির্দিষ্ট মেজারিং ক্যাপ রয়েছে</li>
      <li>সিমিথিকোন থাকায় পেটের অবরুদ্ধ গ্যাস বুদবুদ ভেঙে দ্রুত আরাম দেয়</li>
      <li>মিষ্টি ও কুলিং মিন্ট ফ্লেভার যা খেতে অত্যন্ত আরামদায়ক</li>
      <li>ভারী খাবার খাওয়ার পর পেটে অস্বস্তি কমাতে দারুণ কার্যকর</li>
    </ul>
  </div>
  <p>
    <strong>সেবনবিধি:</strong> খাবার গ্রহণের ১ ঘণ্টা পর এবং রাতে শোবার আগে ২ চামচ (১০ মিলি) করে সেব্য। ব্যবহারের পূর্বে বোতল ভালোভাবে ঝাঁকিয়ে নিন।
  </p>
</div>
`,
    stockQuantity: 350,
    categorySlugOrName: "OTC Medicine",
    regularPrice: 110,
    salePrice: 100,
    flashSalePrice: 89,
    images: [
      "https://images.unsplash.com/photo-1579165466791-78822d31e0a7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 188,
    unitsSold: 1420,
    reviewSnippet: "ভারী খাওয়ার পর এই সিরাপ খেলে পেটের গ্যাস ও ফাঁপা সাথে সাথে দূর হয়। চমৎকার!",
    attributes: {
      genericName: "Aluminium Hydroxide + Magnesium Hydroxide + Simethicone",
      manufacturer: "Square Pharmaceuticals Ltd. (স্কয়ার)",
      dosageForm: "সাসপেনশন (Suspension)",
      strength: "400mg + 400mg + 30mg / 5ml",
      packSize: "২০০ মিলি বোতল (200 ml Bottle)",
      prescriptionRequired: "OTC (প্রেসক্রিপশন ছাড়া কেনা যাবে / Over-The-Counter)",
      darNo: "DAR: 025-012-031",
      indications: "গ্যাস্ট্রিক, আলসার ও এসিডিটি (Acidity & Gastric)",
      storageCondition: "২৫° সে. এর নিচে শুষ্ক ও শীতল স্থানে রাখুন, ফ্রিজ করবেন না",
      expiryDate: "২ বছর (2 Years Shelf Life)",
      sideEffectsWarnings: "খাওয়ার ১ ঘন্টা পর এবং শোবার আগে সেব্য, ব্যবহারের পূর্বে বোতল ঝাঁকিয়ে নিন",
      countryOfOrigin: "বাংলাদেশ (Bangladesh)",
      customSpecs: [
        { id: "spec_1", label: "ফ্লেভার", value: "কুলিং মিন্ট ও পেপারমিন্ট" },
        { id: "spec_2", label: "ভলিউম", value: "২০০ মিলি" },
      ],
    },
  },

  // =========================================================================
  // 4. Gaviscon Double Action 200 ml Bottle (Incepta / Reckitt) - বোতল (200 ml)
  // =========================================================================
  {
    title: "গ্যাভিসকন ডাবল অ্যাকশন সাসপেনশন ২০০ মিলি বোতল | Gaviscon Double Action Liquid Mint Suspension 200 ml Bottle",
    sku: "MED-GAV-DOUBLE-200ML-004",
    slug: "gaviscon-double-action-liquid-200ml-bottle-004",
    shortDescription:
      "আন্তর্জাতিক খ্যাতনামা র‍্যাপিড অ্যাকশন সাসপেনশন বোতল। পাকস্থলীর অ্যাসিড খাদ্যনালীতে ওঠা রোধ করে টানা ৪ ঘণ্টা পর্যন্ত বুক জ্বালাপোড়া দূর রাখে।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">ওষুধ পরিচিতি ও বিবরণ:</h3>
  <p>
    <strong>গ্যাভিসকন ডাবল অ্যাকশন (Gaviscon Double Action Oral Suspension)</strong> রিফ্লাক্স সাপ্রেশন এবং অ্যাসিড নিউট্রিলাইজার হিসেবে বিশ্বব্যাপী সমাদৃত। এটি পাকস্থলীর উপরিভাগে একটি ভাসমান প্রাকৃতিক প্রতিরক্ষামূলক অ্যালজিনেট স্তর (Raft) তৈরি করে, যা টক এসিড ও খাবারকে খাদ্যনালীতে উঠে আসা থেকে সম্পূর্ণ প্রতিহত করে।
  </p>
  <div class="my-4 rounded-xl bg-purple-50/70 p-4 border border-purple-200">
    <h4 class="font-bold text-purple-900 text-sm mb-1">মূল বৈশিষ্ট্য ও গুণাগুণ:</h4>
    <ul class="list-disc pl-5 text-xs text-purple-800 space-y-1">
      <li>ডাবল অ্যাকশন: অতিরিক্ত অ্যাসিড নিউট্রিলাইজ করে এবং রিফ্লাক্স ব্যারিয়ার গড়ে তোলে</li>
      <li>মাত্র ৩ মিনিটে কার্যকর হয়ে দীর্ঘ ৪ ঘণ্টা পর্যন্ত বুক জ্বালাপোড়া ও কাশি রোধ করে</li>
      <li>২০০ মিলি মিন্ট ফ্লেভারড বোতল</li>
      <li>গর্ভবতী মায়েদের বুক জ্বালাপোড়াতেও চিকিৎসকের পরামর্শে নিরাপদ ব্যবহারযোগ্য</li>
    </ul>
  </div>
  <p>
    <strong>সেবনবিধি:</strong> প্রাপ্তবয়স্ক ও ১২ বছরের ঊর্ধ্বদের জন্য ১০-২০ মিলি খাবারের পরে এবং শোয়ার আগে সেব্য।
  </p>
</div>
`,
    stockQuantity: 200,
    categorySlugOrName: "OTC Medicine",
    regularPrice: 320,
    salePrice: 295,
    flashSalePrice: 275,
    images: [
      "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1579165466791-78822d31e0a7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 164,
    unitsSold: 980,
    reviewSnippet: "তীব্র এসিডিটি ও বুক জ্বালাপোড়ার জন্য জাদুর মতো কাজ করে। সেরা রিফ্লাক্স সাসপেনশন!",
    attributes: {
      genericName: "Sodium Alginate + Sodium Bicarbonate + Calcium Carbonate",
      manufacturer: "Incepta Pharmaceuticals Ltd. (ইনসেপ্টা)",
      dosageForm: "সিরাপ (Syrup)",
      strength: "500mg + 213mg + 325mg / 10ml",
      packSize: "২০০ মিলি বোতল (200 ml Bottle)",
      prescriptionRequired: "OTC (প্রেসক্রিপশন ছাড়া কেনা যাবে / Over-The-Counter)",
      darNo: "DAR: 382-045-021",
      indications: "গ্যাস্ট্রিক, আলসার ও এসিডিটি (Acidity & Gastric)",
      storageCondition: "৩০° সে. এর নিচে স্বাভাবিক তাপমাত্রায় সংরক্ষণযোগ্য",
      expiryDate: "২ বছর (2 Years Shelf Life)",
      sideEffectsWarnings: "খাবারের পরে এবং ঘুমানোর পূর্বে সেব্য",
      countryOfOrigin: "যুক্তরাজ্য (UK)",
      customSpecs: [
        { id: "spec_1", label: "কার্যকারিতা গতি", value: "৩ মিনিটে পেটের উপর প্রটেক্টিভ রাফট তৈরি করে" },
        { id: "spec_2", label: "স্থায়িত্ব", value: "টানা ৪ ঘণ্টা পর্যন্ত বুক জ্বালাপোড়া মুক্ত" },
      ],
    },
  },

  // =========================================================================
  // 5. Eno Fruit Salt Fast Relief Antacid 5g Sachet - পিস / স্যাচেট (5g)
  // =========================================================================
  {
    title: "ইনো ফ্রুট সল্ট ফাস্ট রিলিফ অ্যান্টাসিড ৫ গ্রাম স্যাচেট (লেমন) | Eno Fruit Salt Fast Relief Antacid 5g Sachet (Lemon)",
    sku: "MED-ENO-LEMON-5G-005",
    slug: "eno-fruit-salt-lemon-5g-sachet-005",
    shortDescription:
      "মাত্র ৬ সেকেন্ডে কাজ শুরু করা রিফ্রেশিং লেমন ফ্লেভারের বাবলিং অ্যান্টাসিড স্যাচেট। পেটের অস্বস্তি, গ্যাস ও ভারী ভাব মুহূর্তেই দূর করে।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">ওষুধ পরিচিতি ও বিবরণ:</h3>
  <p>
    <strong>ইনো ফ্রুট সল্ট (Eno Fast Relief Antacid Sachet)</strong> বিশ্বের বহুল জনপ্রিয় এবং দ্রুততম সময়ে এসিডিটি নিরাময়কারী ইফারভেসেন্ট ফ্রুট সল্ট। পানিতে মেশানোর সাথে সাথে এটি বুদবুদ সৃষ্টি করে সক্রিয় হয়ে ওঠে এবং পাকস্থলীর অতিরিক্ত ক্ষতিকর অ্যাসিড প্রশমিত করে।
  </p>
  <div class="my-4 rounded-xl bg-amber-50/70 p-4 border border-amber-200">
    <h4 class="font-bold text-amber-900 text-sm mb-1">মূল বৈশিষ্ট্য ও গুণাগুণ:</h4>
    <ul class="list-disc pl-5 text-xs text-amber-800 space-y-1">
      <li>পানিতে মেশানোর মাত্র ৬ সেকেন্ডে কাজ শুরু করে</li>
      <li>৫ গ্রামের একক ব্যবহারযোগ্য কমপ্যাক্ট স্যাচেট প্যাকেট (পিস)</li>
      <li>তাজা লেবুর সুগন্ধ ও সুস্বাদু স্বাদে সমৃদ্ধ</li>
      <li>দাওয়াত বা গুরুপাক খাবারের পর পেটের তাৎক্ষণিক স্বস্তিতে অতুলনীয়</li>
    </ul>
  </div>
  <p>
    <strong>সেবনবিধি:</strong> ১টি স্যাচেট (৫ গ্রাম পাউডার) এক গ্লাস সাধারণ পানিতে (১৫০ মিলি) ঢালুন এবং বুদবুদ শেষ হওয়ার পূর্বেই সঙ্গে সঙ্গে পান করুন।
  </p>
</div>
`,
    stockQuantity: 1000,
    categorySlugOrName: "OTC Medicine",
    regularPrice: 25,
    salePrice: 20,
    flashSalePrice: 17,
    images: [
      "https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 420,
    unitsSold: 4600,
    reviewSnippet: "দাওয়াতে খেয়ে পেটে গ্যাস হলে ইনোর কোনো বিকল্প নেই। ৬ সেকেন্ডেই আরাম পাওয়া যায়।",
    attributes: {
      genericName: "Sodium Bicarbonate + Citric Acid (Eno Fruit Salt)",
      manufacturer: "GSK Bangladesh (জিএসকে)",
      dosageForm: "পাউডার ও স্যাচেট (Powder / Sachet / ORS)",
      strength: "5g Per Sachet",
      packSize: "১ প্যাকেট / স্যাচেট (1 Sachet)",
      prescriptionRequired: "OTC (প্রেসক্রিপশন ছাড়া কেনা যাবে / Over-The-Counter)",
      darNo: "DAR: 014-067-088",
      indications: "গ্যাস্ট্রিক, আলসার ও এসিডিটি (Acidity & Gastric)",
      storageCondition: "শুষ্ক ও শীতল স্থানে রাখুন, আর্দ্রতা থেকে দূরে রাখুন",
      expiryDate: "২ বছর (2 Years Shelf Life)",
      sideEffectsWarnings: "এক গ্লাস জলে (১৫০ মিলি) গুলিয়ে সঙ্গে সঙ্গে পান করুন",
      countryOfOrigin: "বাংলাদেশ (Bangladesh)",
      customSpecs: [
        { id: "spec_1", label: "কার্যকারিতা সময়", value: "৬ সেকেন্ডে অ্যাকশন শুরু" },
        { id: "spec_2", label: "ফ্লেভার", value: "রিফ্রেশিং লেমন ফ্লেভার" },
      ],
    },
  },

  // =========================================================================
  // 6. Pantonix 40 mg Tablet (Incepta Pharmaceuticals) - পাতা (1 Strip of 10)
  // =========================================================================
  {
    title: "প্যান্টোনিক্স ৪০ মি.গ্রা. ট্যাবলেট (প্যান্টোপ্রাজল) - ইনসেপ্টা | Pantonix 40 mg Tablet (Pantoprazole) by Incepta",
    sku: "MED-PAN-40-TAB-006",
    slug: "pantonix-40mg-tablet-pantoprazole-incepta-006",
    shortDescription:
      "ইনসেপ্টা ফার্মার হাই-পোটেন্সি প্যান্টোপ্রাজল ৪০ মি.গ্রা. ট্যাবলেট। ক্রনিক গ্যাস্ট্রিক আলসার ও মারাত্মক এসিডিটির জন্য অত্যন্ত কার্যকরী।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">ওষুধ পরিচিতি ও বিবরণ:</h3>
  <p>
    <strong>প্যান্টোনিক্স ৪০ মি.গ্রা. (Pantonix 40 mg)</strong> ইনসেপ্টা ফার্মাসিউটিক্যালসের প্রোটন পাম্প ব্লকার (Pantoprazole Sodium Sesquihydrate)। এটি পাকস্থলীর অ্যাসিড উৎপাদনকারী এনজাইম সিস্টেম হাইড্রোজেন-পটাশিয়াম এটিপেজ (H+/K+ ATPase)-কে সুনির্দিষ্টভাবে প্রতিহত করে ২৪ ঘণ্টার জন্য গ্যাস্ট্রিক অ্যাসিডের মাত্রা নিরাপদ স্তরে নামিয়ে আনে।
  </p>
  <div class="my-4 rounded-xl bg-rose-50/70 p-4 border border-rose-200">
    <h4 class="font-bold text-rose-900 text-sm mb-1">মূল বৈশিষ্ট্য ও গুণাগুণ:</h4>
    <ul class="list-disc pl-5 text-xs text-rose-800 space-y-1">
      <li>৪০ মিলিগ্রাম এন্টারিক-কোটেড গ্যাস্ট্রো-রেজিস্ট্যান্ট ট্যাবলেট</li>
      <li>ক্রনিক আলসার ও খাদ্যনালীর ক্ষত দ্রুত আরোগ্য করে</li>
      <li>অ্যালু-অ্যালু প্রটেক্টিভ ব্লিস্টার স্ট্রিপ (পাতা)</li>
      <li>ইনসেপ্টা ফার্মার সর্বোচ্চ আন্তর্জাতিক মান নিশ্চিত</li>
    </ul>
  </div>
  <p>
    <strong>সেবনবিধি:</strong> রেজিস্টার্ড চিকিৎসকের প্রেসক্রিপশন অনুযায়ী খাবার গ্রহণের ৩০-৬০ মিনিট পূর্বে ১টি ট্যাবলেট সম্পূর্ণ গিলে সেবন করতে হবে। চিবানো বা ভেঙে খাওয়া যাবে না।
  </p>
</div>
`,
    stockQuantity: 400,
    categorySlugOrName: "Prescription Medicine",
    regularPrice: 100,
    salePrice: 90,
    flashSalePrice: 82,
    images: [
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 195,
    unitsSold: 1650,
    reviewSnippet: "দীর্ঘদিনের গ্যাস্ট্রিকের সমস্যায় প্যান্টোনিক্স ৪০ অনেক ভালো কাজ দেয়। ডাক্তারের পরামর্শে খাচ্ছি।",
    attributes: {
      genericName: "Pantoprazole (প্যান্টোপ্রাজল)",
      manufacturer: "Incepta Pharmaceuticals Ltd. (ইনসেপ্টা)",
      dosageForm: "ট্যাবলেট (Tablet)",
      strength: "40 mg",
      packSize: "১০টি ট্যাবলেটের পাতা (1 Strip of 10)",
      prescriptionRequired: "Rx (ডাক্তারের প্রেসক্রিপশন আবশ্যক / Prescription Required)",
      darNo: "DAR: 122-094-041",
      indications: "গ্যাস্ট্রিক, আলসার ও এসিডিটি (Acidity & Gastric)",
      storageCondition: "৩০° সে. এর নিচে, শুষ্ক ও আলো থেকে দূরে রাখুন",
      expiryDate: "৩ বছর (3 Years Shelf Life)",
      sideEffectsWarnings: "খাওয়ার ৩০ মিনিট পূর্বে পুরো ট্যাবলেটটি চিবানো ছাড়াই গিলতে হবে",
      countryOfOrigin: "বাংলাদেশ (Bangladesh)",
      customSpecs: [
        { id: "spec_1", label: "ডোজ শক্তি", value: "৪০ মিলিগ্রাম হাই-পোটেন্সি" },
        { id: "spec_2", label: "চিকিৎসকের প্রেসক্রিপশন", value: "প্রেসক্রিপশন অনুযায়ী সেব্য" },
      ],
    },
  },
];

async function main() {
  console.log("🌱 Starting Seeding Gastric Medicines (পাতায়, বোতলে ml, পিস/স্যাচেট)...");

  // 1. Fetch vendor
  const vendor = await prisma.vendor.findFirst();
  if (!vendor) {
    throw new Error("No vendor found in the database. Please register a vendor first.");
  }
  console.log(`👤 Using Vendor: ${vendor.storeName} (${vendor.id})`);

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
          c.name.toLowerCase().includes("medicine") ||
          c.name.toLowerCase().includes("health")
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
                featuredBadgeText: "ফার্মেসি চয়েস",
                bannerImage: item.images[0],
                displayOrder: i + 1,
              },
              update: {
                featuredBadgeText: "ফার্মেসি চয়েস",
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
              featuredBadgeText: "ফার্মেসি চয়েস",
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

  console.log("🎉 Successfully seeded 6 Gastric Medicine Products across all variants (পাতা, বোতল ml, পিস/স্যাচেট)!");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
