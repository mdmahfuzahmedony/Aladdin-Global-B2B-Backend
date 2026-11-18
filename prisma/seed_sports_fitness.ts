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

const sportsProductsToSeed: ProductSeedItem[] = [
  // =========================================================================
  // 1. SS Master 5000 English Willow Cricket Bat
  // =========================================================================
  {
    title: "এসএস মাস্টার ৫০০০ ইংলিশ উইলো ক্রিকেট ব্যাট - ফুল সাইজ এসএইচ | SS Master 5000 English Willow",
    sku: "SPT-SS-MST5000-SH",
    slug: "ss-master-5000-english-willow-cricket-bat-sh",
    shortDescription:
      "গ্রেড ১ হ্যান্ড-সিলেক্টেড ইংলিশ উইলো, ৩৯-৪০ মিমি ম্যাসিভ এজ, ৮-১০ টি ক্লিয়ার স্ট্রেইট গ্রেইনস এবং পারফেক্ট ব্যালেন্স সমৃদ্ধ প্রফেশনাল টুর্নামেন্ট ক্রিকেট ব্যাট।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">এসএস মাস্টার ৫০০০ ক্রিকেট ব্যাট বিবরণ:</h3>
  <p>
    বিশ্ববিখ্যাত ভারতীয় ক্রিকেট গিয়ার ব্র্যান্ড <strong>SS (Sareen Sports)</strong> এর জনপ্রিয় মাস্টার সিরিজের প্রিমিয়াম ব্যাট। এর বিশাল সুইট স্পট এবং লাইটওয়েট পিকআপ পাওয়ার হিটিং ও প্রফেশনাল ক্লাসিক্যাল স্ট্রোক প্লের জন্য সেরা।
  </p>
  <div class="my-4 rounded-xl bg-orange-50/70 p-4 border border-orange-200">
    <h4 class="font-bold text-orange-900 text-sm mb-1">ব্যাটটির টেকনিক্যাল বৈশিষ্ট্য:</h4>
    <ul class="list-disc pl-5 text-xs text-orange-800 space-y-1">
      <li><strong>কাঠের গ্রেড:</strong> প্রিমিয়াম এয়ার-ড্রাইড গ্রেড ১ ইংলিশ উইলো</li>
      <li><strong>গ্রেইনস:</strong> ৮ থেকে ১০টি স্পষ্ট সোজা কাঠ গ্রেইনস</li>
      <li><strong>এজ থিকনেস:</strong> ৩৯-৪০ মিমি কনট্যুরড ম্যাসিভ পাওয়ার এজ</li>
      <li><strong>ওজন:</strong> ১১৮৫ গ্রাম (সুপার লাইটওয়েট ব্যালেন্সড পিকআপ)</li>
      <li><strong>হ্যান্ডেল:</strong> ১২ পিসের সারওয়াক ক্যান হ্যান্ডেল যা বলের শক নিখুঁতভাবে শোষণ করে</li>
      <li><strong>সাইজ:</strong> মেনস ফুল সাইজ শর্ট হ্যান্ডেল (SH)</li>
    </ul>
  </div>
</div>
`,
    stockQuantity: 25,
    categorySlugOrName: "Sports Accessories",
    regularPrice: 16500,
    salePrice: 14800,
    flashSalePrice: 13900,
    images: [
      "https://images.unsplash.com/photo-1531415074868-036b1c5f53ec?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 110,
    unitsSold: 420,
    reviewSnippet: "ব্যাটের পিকআপ অসম্ভব হালকা আর পাঞ্চ অসাধারণ! লেদার বলে দারুণ সাউন্ড আসে।",
    attributes: {
      sportDiscipline: "Cricket / ক্রিকেট",
      equipmentType: "Cricket Bat / ক্রিকেট ব্যাট",
      brand: "SS (Sareen Sports)",
      modelName: "Master 5000 English Willow SH",
      sizeAgeGroup: "Full Size / Short Handle (SH) - Adult",
      materialWoodType: "Grade 1 Hand-Selected English Willow (ইংলিশ উইলো ব্যাট)",
      weightBalance: "1180 - 1220 grams (লাইটওয়েট ব্যাট)",
      tournamentApproval: "ICC Tournament Standard / প্রফেশনাল ম্যাচ গ্রেড",
      warranty: "Wood Grain Guarantee (ক্রিকেট ব্যাট)",
      countryOfOrigin: "India (Meerut / Jalandhar)",
      customSpecs: [
        { id: "spec_1", label: "গ্রেইনস সংখ্যা", value: "8-10 Straight & Clear Grains" },
        { id: "spec_2", label: "এজ প্রোফাইল", value: "39-40mm Massive Contoured Edges" },
        { id: "spec_3", label: "হ্যান্ডেল কনস্ট্রাকশন", value: "12-Piece Sarawak Cane Shock-Absorption" },
      ],
    },
  },

  // =========================================================================
  // 2. Molten Vantaggio 5000 FIFA Quality Pro Football
  // =========================================================================
  {
    title: "মল্টেন ভ্যানটাজিও ৫০০০ ফিফা কোয়ালিটি প্রো ম্যাচ ফুটবল - সাইজ ৫ | Molten Vantaggio 5000",
    sku: "SPT-MLT-VG5000-SZ5",
    slug: "molten-vantaggio-5000-fifa-quality-pro-football-size5",
    shortDescription:
      "অফিসিয়াল ফিফা কোয়ালিটি প্রো অনুমোদিত থার্মাল বন্ডিং টেকনোলজি, নিখুঁত অ্যারোডাইনামিক ট্রাজেক্টরি এবং টেক্সচার্ড পিইউ লেদারের পেশাদার ফুটবল।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">মল্টেন ভ্যানটাজিও ৫০০০ ফুটবল বিবরণ:</h3>
  <p>
    <strong>Molten Vantaggio 5000 (F5A5000)</strong> আন্তর্জাতিক ফুটবল অ্যাসোসিয়েশন এবং শীর্ষ লিগগুলোতে ব্যবহৃত ফিফা অনুমোদিত ম্যাচ বল। এর পেটেন্টেড ACENTEC টেকনোলজি কোনো সেলাই ছাড়াই প্যানেলগুলোকে নিখুঁতভাবে যুক্ত রাখে, ফলে বৃষ্টিতেও বল ভারী হয় না।
  </p>
  <div class="my-4 rounded-xl bg-blue-50/70 p-4 border border-blue-200">
    <h4 class="font-bold text-blue-900 text-sm mb-1">বলটির শীর্ষ বৈশিষ্ট্যসমূহ:</h4>
    <ul class="list-disc pl-5 text-xs text-blue-800 space-y-1">
      <li><strong>ফিফা সার্টিফিকেট:</strong> FIFA Quality Pro (সর্বোচ্চ আন্তর্জাতিক ম্যাচ স্ট্যান্ডার্ড)</li>
      <li><strong>টেকনোলজি:</strong> ACENTEC Cross-fusion Seamless Thermal Bonding</li>
      <li><strong>মেটেরিয়াল:</strong> প্রিমিয়াম হাই-ডেনসিটি টেক্সচার্ড PU লেদার</li>
      <li><strong>সাইজ ও ওজন:</strong> সাইজ ৫ (৪২০-৪৩০ গ্রাম অফিসিয়াল ম্যাচ ওজন)</li>
      <li><strong>পানি প্রতিরোধক:</strong> সিমলেস গঠনের কারণে ০% ওয়াটার অ্যাবজরপশন</li>
    </ul>
  </div>
</div>
`,
    stockQuantity: 40,
    categorySlugOrName: "Sports Accessories",
    regularPrice: 4800,
    salePrice: 3950,
    flashSalePrice: 3600,
    images: [
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 88,
    unitsSold: 360,
    reviewSnippet: "বলের সুইং আর কন্ট্রোল এক কথায় অসাধারণ! ভেজা মাঠেও একদম ভারী হয় না।",
    attributes: {
      sportDiscipline: "Football / Soccer / ফুটবল",
      equipmentType: "Football / ম্যাচ ফুটবল",
      brand: "Molten",
      modelName: "Vantaggio 5000 (F5A5000)",
      sizeAgeGroup: "Size 5 - Standard Official Football (Adult)",
      materialWoodType: "Hand-Stitched Textured PU Leather (ফুটবল)",
      weightBalance: "410 - 450 grams (ফিফা অফিসিয়াল ম্যাচ ফুটবল)",
      tournamentApproval: "FIFA Quality Pro / Match Ball Standard",
      warranty: "Official 1 Year Shape & Stitching Guarantee",
      countryOfOrigin: "Pakistan (Sialkot - Sports Capital)",
      customSpecs: [
        { id: "spec_1", label: "কনস্ট্রাকশন টেকনোলজি", value: "ACENTEC Seamless Thermal Bonding" },
        { id: "spec_2", label: "ব্লাডার টাইপ", value: "High Air-Retention Natural Latex" },
        { id: "spec_3", label: "সারফেস গ্রিপ", value: "Dimpled High-Traction Texture" },
      ],
    },
  },

  // =========================================================================
  // 3. Yonex Astrox 88D Pro Full Carbon Badminton Racket
  // =========================================================================
  {
    title: "ইয়োনেক্স অ্যাস্ট্রক্স ৮৮ডি প্রো ফুল কার্বন গ্রাফাইট ব্যাডমিন্টন র‍্যাকেট - ৪ইউ জি৫ | Yonex Astrox 88D Pro",
    sku: "SPT-YNX-AST88D-PRO",
    slug: "yonex-astrox-88d-pro-carbon-graphite-badminton-racket",
    shortDescription:
      "জাপানি হাই-মডুলাস কার্বন গ্রাফাইট, রোটেশনাল জেনারেটর সিস্টেম এবং ডেডিকেটেড ব্যাককোর্ট পাওয়ার স্ম্যাশ সমৃদ্ধ বিডব্লিউএফ অনুমোদিত টুর্নামেন্ট র‍্যাকেট।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">ইয়োনেক্স অ্যাস্ট্রক্স ৮৮ডি প্রো বিবরণ:</h3>
  <p>
    <strong>Yonex Astrox 88D Pro</strong> বিশ্বের শীর্ষস্থানীয় ডাবলস ও সিঙ্গেলস শাটলারদের সবচেয়ে পছন্দের র‍্যাকেট। এর হেড-হেভি ব্যালেন্স শটগুলোতে অপ্রতিরোধ্য পাওয়ার ও তীক্ষ্ণ ডাউনওয়ার্ড অ্যাঙ্গেল এনে দেয়।
  </p>
  <div class="my-4 rounded-xl bg-purple-50/70 p-4 border border-purple-200">
    <h4 class="font-bold text-purple-900 text-sm mb-1">র‍্যাকেটের প্রধান টেকনিক্যাল স্পেক্স:</h4>
    <ul class="list-disc pl-5 text-xs text-purple-800 space-y-1">
      <li><strong>উপাদান:</strong> HM Graphite + CFR + Tungsten + 2G-Namd Flex Force</li>
      <li><strong>ওজন ও গ্রিপ:</strong> 4U (গড়ে ৮৩ গ্রাম) / G5 গ্রিপ সাইজ</li>
      <li><strong>ব্যালেন্স:</strong> হেড-হেভি (Head Heavy Power Smash)</li>
      <li><strong>স্ট্রিং টেনশন ক্ষমতা:</strong> সর্বোচ্চ ২৮ পাউন্ড (Recommended 24-26 lbs)</li>
      <li><strong>অনুমোদন:</strong> BWF World Tour Approved Tournament Grade</li>
    </ul>
  </div>
</div>
`,
    stockQuantity: 18,
    categorySlugOrName: "Sports Accessories",
    regularPrice: 18500,
    salePrice: 16900,
    flashSalePrice: 15999,
    images: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1521537634581-0dced2fed2a8?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 65,
    unitsSold: 190,
    reviewSnippet: "স্ম্যাশে প্রচণ্ড পাওয়ার আসে! ফ্রেম অত্যন্ত মজবুত এবং শাটলে নিখুঁত কন্ট্রোল পাওয়া যায়।",
    attributes: {
      sportDiscipline: "Badminton / ব্যাডমিন্টন",
      equipmentType: "Badminton Racket / ব্যাডমিন্টন র‍্যাকেট",
      brand: "Yonex",
      modelName: "Astrox 88D Pro (3rd Generation)",
      sizeAgeGroup: "Standard G3/G4 Badminton Grip Size",
      materialWoodType: "100% High Modulus Carbon Graphite (র‍্যাকেট)",
      weightBalance: "80 - 84 grams / 4U (হেড-হেভি অ্যাটাকিং র‍্যাকেট)",
      tournamentApproval: "BWF Approved Tournament Grade (Badminton)",
      warranty: "Official 1 Year Frame Warranty (র‍্যাকেট)",
      countryOfOrigin: "Japan (Yonex Original)",
      customSpecs: [
        { id: "spec_1", label: "ম্যাক্সিমাম স্ট্রিং টেনশন", value: "28 lbs Max String Tension" },
        { id: "spec_2", label: "শ্যাফট ফ্লেক্সিবিলিটি", value: "Stiff / Extra Power Flex Force" },
        { id: "spec_3", label: "ফ্রেম টেকনোলজি", value: "Rotational Generator System + Energy Boost Cap" },
      ],
    },
  },

  // =========================================================================
  // 4. Decathlon Hex Rubber Coated Dumbbells 10kg Pair (Total 20kg)
  // =========================================================================
  {
    title: "হেক্সাগোনাল রাবার কোটেড সলিড কাস্ট আয়রন ডাম্বেল (১০ কেজি পেয়ার - মোট ২০ কেজি) | Hex Dumbbell Pair",
    sku: "FIT-HEX-DB-10KG-PR",
    slug: "hexagonal-rubber-coated-cast-iron-dumbbell-10kg-pair",
    shortDescription:
      "মেঝে সুরক্ষাকারী নন-রোল হেক্স ডিজাইন, রাবার কোটেড ঢালাই লোহা এবং ক্রোম ফিনিশড খাঁজকাটা স্টিল গ্রিপ সহ ২০ কেজির কমপ্লিট ডাম্বেল পেয়ার।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">হেক্স রাবার ডাম্বেল পেয়ার বিবরণ:</h3>
  <p>
    হোম জিম ও প্রফেশনাল ফিটনেস সেন্টারের জন্য <strong>Hex Rubber Dumbbell</strong> অত্যন্ত জনপ্রিয় ও নিরাপদ। এর ষড়ভুজ (৬-কোনা) নকশা ডাম্বেলকে মেঝেতে গড়িয়ে পড়া থেকে রক্ষা করে এবং পুশ-আপ সহ যেকোনো ফ্লোর এক্সারসাইজে স্টেবল সাপোর্ট দেয়।
  </p>
  <div class="my-4 rounded-xl bg-emerald-50/70 p-4 border border-emerald-200">
    <h4 class="font-bold text-emerald-900 text-sm mb-1">ডাম্বেলের প্রধান সুবিধাসমূহ:</h4>
    <ul class="list-disc pl-5 text-xs text-emerald-800 space-y-1">
      <li><strong>ওজন:</strong> ১০ কেজি করে দুটি ডাম্বেল (মোট ২০ কেজি পেয়ার)</li>
      <li><strong>মেটেরিয়াল:</strong> সলিড ঢালাই লোহা ও ভার্জিন গন্ধহীন রাবার এনকেসিং</li>
      <li><strong>হ্যান্ডেল:</strong> নন-স্লিপ আর্চড ক্রোম প্লেটেড খাঁজকাটা গ্রিপ</li>
      <li><strong>ফ্লোর প্রটেকশন:</strong> মেঝেতে শব্দ হয় না এবং টাইলসের ক্ষতি করে না</li>
      <li><strong>ডিজাইন:</strong> অ্যান্টি-রোল হেক্সাগোনাল হেড</li>
    </ul>
  </div>
</div>
`,
    stockQuantity: 50,
    categorySlugOrName: "Fitness Accessories",
    regularPrice: 4500,
    salePrice: 3800,
    flashSalePrice: 3499,
    images: [
      "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 135,
    unitsSold: 580,
    reviewSnippet: "হ্যান্ডেল গ্রিপটা পারফেক্ট। কোনো গন্ধ নেই আর রাবার ফিনিশ থাকায় টাইলসে রাখলেও আওয়াজ হয় না।",
    attributes: {
      fitnessItemType: "Dumbbells & Barbells / ডাম্বেল ও বারবেল",
      brand: "Decathlon / Domyos",
      modelName: "Hex Heavy Rubber Dumbbell 10kg x 2",
      weightResistance: "10 kg Pair (মোট ২০ কেজি)",
      maxLoadCapacity: "N/A (প্রযোজ্য নয়)",
      targetUser: "Unisex Adult (পুরুষ ও নারী উভয়ের জন্য)",
      material: "Solid Cast Iron + Rubber Encased (রাবার কোটেড ঢালাই লোহা)",
      dimensionsSize: "Standard 1-Inch Handle / Anti-Roll Hex",
      gripAntiSlip: "Knurled Textured Ergonomic Steel Grip (নন-স্লিপ খাঁজকাটা)",
      warranty: "7 Days Checking / Replacement Guarantee",
      countryOfOrigin: "China",
      customSpecs: [
        { id: "spec_1", label: "মেঝে সুরক্ষা", value: "Virgin Odorless Rubber Protects Floors & Tiles" },
        { id: "spec_2", label: "হ্যান্ডেল মেটেরিয়াল", value: "Ergonomic Contoured Chrome Knurled Grip" },
        { id: "spec_3", label: "হেড শেপ", value: "Anti-Roll 6-Sided Hexagon Design" },
      ],
    },
  },

  // =========================================================================
  // 5. NBR 8mm Yoga & Exercise Mat with Free Strap
  // =========================================================================
  {
    title: "প্রিমিয়াম ৮ মিমি ডুয়েল লেয়ার নন-স্লিপ এনবিআর ইয়োগা ও ওয়ার্কআউট ম্যাট | NBR 8mm Yoga Mat",
    sku: "FIT-YOG-MAT-8MM-NBR",
    slug: "premium-8mm-dual-layer-non-slip-nbr-yoga-exercise-mat",
    shortDescription:
      "উচ্চ ঘনত্বের পরিবেশবান্ধব এনবিআর ফোম, ৮ মিমি জয়েন্ট-প্রটেক্টিং কুশনিং, ওয়াটারপ্রুফ এবং ক্যারি স্ট্র্যাপ সহ প্রিমিয়াম নন-স্লিপ ইয়োগা ম্যাট।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">৮ মিমি এনবিআর ইয়োগা ম্যাট বিবরণ:</h3>
  <p>
    যোগব্যায়াম, অ্যারোবিক্স, স্ট্রেচিং ও ফ্লোর এক্সারসাইজের জন্য <strong>NBR 8mm Yoga Mat</strong> অন্যতম সেরা অনুষঙ্গ। ৮ মিমি অতিরিক্ত পুরুত্ব মেঝেতে হাঁটু ও কনুইয়ের ওপর চাপ বহুলাংশে কমিয়ে দেয়।
  </p>
  <div class="my-4 rounded-xl bg-teal-50/70 p-4 border border-teal-200">
    <h4 class="font-bold text-teal-900 text-sm mb-1">ম্যাটটির সুবিধাসমূহ:</h4>
    <ul class="list-disc pl-5 text-xs text-teal-800 space-y-1">
      <li><strong>পুরুত্ব:</strong> ৮ মিমি হাই-ডেনসিটি জয়েন্ট প্রটেকশন কুশনিং</li>
      <li><strong>আকার:</strong> ১৮৩ সেমি x ৬১ সেমি (৭২ x ২৪ ইঞ্চি লম্বা সাইজ)</li>
      <li><strong>গ্রিপ:</strong> ডাবল-সাইডেড অ্যান্টি-স্লিপ রিবড টেক্সচার</li>
      <li><strong>ক্লিনিং:</strong> ঘাম ও ওয়াটার রেজিস্ট্যান্ট, ভেজা কাপড় দিয়ে সহজে পরিষ্কারযোগ্য</li>
      <li><strong>উপহার:</strong> সহজে কাঁধে ঝুলিয়ে বহনের জন্য ফ্রি ইলাস্টিক ক্যারি স্ট্র্যাপ</li>
    </ul>
  </div>
</div>
`,
    stockQuantity: 90,
    categorySlugOrName: "Fitness Accessories",
    regularPrice: 1450,
    salePrice: 1050,
    flashSalePrice: 920,
    images: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 155,
    unitsSold: 720,
    reviewSnippet: "৮ মিমি পুরু হওয়ার কারণে হাঁটুতে কোনো ব্যথা লাগে না। ম্যাটটি একেবারেই পিচ্ছিল নয়।",
    attributes: {
      fitnessItemType: "Yoga Mat & Exercise Mat / ইয়োগা ম্যাট",
      brand: "LiveUp",
      modelName: "Pro Comfort 8mm Yoga Mat with Strap",
      weightResistance: "N/A (প্রযোজ্য নয়)",
      maxLoadCapacity: "N/A (প্রযোজ্য নয়)",
      targetUser: "Unisex Adult (পুরুষ ও নারী উভয়ের জন্য)",
      material: "High Density NBR / EVA Eco-friendly Foam",
      dimensionsSize: "8mm Thickness (Extra Cushioning Mat)",
      gripAntiSlip: "Double-Sided Non-Slip Textured Surface (দ্বিমুখী গ্রিপ)",
      warranty: "7 Days Checking / Replacement Guarantee",
      countryOfOrigin: "China",
      customSpecs: [
        { id: "spec_1", label: "পরিমাপ", value: "183 cm x 61 cm (72 x 24 Inch Full Length)" },
        { id: "spec_2", label: "কুশনিং পুরুত্ব", value: "8mm High Density Joint-Protection NBR Foam" },
        { id: "spec_3", label: "অতিরিক্ত অনুষঙ্গ", value: "Free Elastic Shoulder Carry Strap Included" },
      ],
    },
  },

  // =========================================================================
  // 6. 10-60kg Adjustable Hand Gripper with Counter
  // =========================================================================
  {
    title: "১০-৬০ কেজি অ্যাডজাস্টেবল হ্যান্ড গ্রিপার ও ফোরআর্ম স্ট্রেন্থেনার - কাউন্টার সহ | 10-60kg Gripper",
    sku: "FIT-GRP-ADJ-10-60KG",
    slug: "10-60kg-adjustable-hand-gripper-forearm-counter",
    shortDescription:
      "১০ থেকে ৬০ কেজি পর্যন্ত অ্যাডজাস্টেবল স্প্রিং টেনশন, মেকানিক্যাল পুশ কাউন্টার এবং রাবারাইজড কমফোর্ট গ্রিপ সহ ফোরআর্ম ও হাতের শক্তি বাড়ানোর সেরা গ্রিপার।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">অ্যাডজাস্টেবল হ্যান্ড গ্রিপার বিবরণ:</h3>
  <p>
    <strong>10-60kg Adjustable Hand Gripper</strong> হাতের কব্জি, আঙ্গুল এবং ফোরআর্মের পেশী শক্তিশালী করার জন্য অত্যন্ত কার্যকর। নব ঘুরিয়ে সহজে ১০ থেকে ৬০ কেজি পর্যন্ত রেজিস্ট্যান্স বাড়ানো বা কমানো যায়।
  </p>
  <div class="my-4 rounded-xl bg-amber-50/70 p-4 border border-amber-200">
    <h4 class="font-bold text-amber-900 text-sm mb-1">গ্রিপারের প্রধান বৈশিষ্ট্য:</h4>
    <ul class="list-disc pl-5 text-xs text-amber-800 space-y-1">
      <li><strong>রেজিস্ট্যান্স রেঞ্জ:</strong> ১০ কেজি থেকে ৬০ কেজি পর্যন্ত কাস্টমাইজযোগ্য</li>
      <li><strong>কাউন্টার:</strong> নিচে বিল্ট-ইন মেকানিক্যাল কাউন্টার যা প্রতিবারের চাপ স্বয়ংক্রিয় গণনা করে</li>
      <li><strong>স্প্রিং:</strong> উচ্চমানের অ্যালয় স্টিল স্প্রিং যা দীর্ঘদিন ব্যবহারে ঢিলে হয় না</li>
      <li><strong>হ্যান্ডেল:</strong> নন-স্লিপ নরম টিপিআর রাবারাইজড গ্রিপ</li>
      <li><strong>সুবিধা:</strong> পকেট সাইজ হওয়ায় অফিস বা ট্র্যাভেলে যেকোনো জায়গায় ব্যবহারযোগ্য</li>
    </ul>
  </div>
</div>
`,
    stockQuantity: 150,
    categorySlugOrName: "Fitness Accessories",
    regularPrice: 550,
    salePrice: 380,
    flashSalePrice: 330,
    images: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 195,
    unitsSold: 1120,
    reviewSnippet: "কাউন্টার থাকায় কয়টা পুশ করলাম গুনে দেখতে হয় না। নব ঘুরিয়ে খুব সহজে টাইট বা ঢিলে করা যায়।",
    attributes: {
      fitnessItemType: "Hand Gripper & Finger Exerciser / গ্রিপার",
      brand: "Aolikes",
      modelName: "R-Type Adjustable Hand Gripper with Counter",
      weightResistance: "10 - 60 kg Adjustable (হ্যান্ড গ্রিপার)",
      maxLoadCapacity: "N/A (প্রযোজ্য নয়)",
      targetUser: "Unisex Adult (পুরুষ ও নারী উভয়ের জন্য)",
      material: "Stainless Steel + Heavy Duty Alloy",
      dimensionsSize: "Free Size / Adjustable Strap",
      gripAntiSlip: "Soft Sweat-Absorbent Foam Cushioned Handle",
      warranty: "7 Days Checking / Replacement Guarantee",
      countryOfOrigin: "China",
      customSpecs: [
        { id: "spec_1", label: "রেজিস্ট্যান্স সীমা", value: "10 kg to 60 kg Infinitely Dial Adjustable" },
        { id: "spec_2", label: "স্প্রিং মেটেরিয়াল", value: "High-Tensile Heavy Duty Alloy Steel" },
        { id: "spec_3", label: "কাউন্টিং সিস্টেম", value: "Built-in Mechanical Repetition Click Counter" },
      ],
    },
  },
];

async function main() {
  console.log("🌱 Starting Seeding Sports & Fitness Products...");

  const vendor = await prisma.vendor.findFirst();
  if (!vendor) {
    throw new Error("No vendor found in the database. Please register a vendor first.");
  }
  console.log(`👤 Using Vendor: ${vendor.storeName} (${vendor.id})`);

  const allCategories = await prisma.category.findMany();

  const flashSaleStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const flashSaleEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const newArrivalStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newArrivalEnd = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < sportsProductsToSeed.length; i++) {
    const item = sportsProductsToSeed[i];

    let targetCat = allCategories.find(
      (c) =>
        c.name.toLowerCase() === item.categorySlugOrName.toLowerCase() ||
        c.slug.toLowerCase().includes(item.categorySlugOrName.toLowerCase())
    );

    if (!targetCat) {
      targetCat = allCategories.find(
        (c) =>
          c.name.toLowerCase().includes("sport") ||
          c.name.toLowerCase().includes("fitness")
      );
    }

    if (!targetCat) {
      throw new Error(`Category not found for: ${item.categorySlugOrName}`);
    }

    const finalCategoryId = targetCat.id;

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
                discountBadge: "Sports Deal",
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
                salesBadge: "Top Pick",
                isExpressEligible: true,
              },
              update: {
                unitsSold: item.unitsSold,
                salesBadge: "Top Pick",
              },
            },
          },
          featuredAttribute: {
            upsert: {
              create: {
                featuredBadgeText: "সেরা স্পোর্টস গিয়ার",
                bannerImage: item.images[0],
                displayOrder: i + 1,
              },
              update: {
                featuredBadgeText: "সেরা স্পোর্টস গিয়ার",
                bannerImage: item.images[0],
                displayOrder: i + 1,
              },
            },
          },
          newArrivalAttribute: {
            upsert: {
              create: {
                badgeText: "New Season",
                displayOrder: i + 1,
                startDate: newArrivalStart,
                endDate: newArrivalEnd,
              },
              update: {
                badgeText: "New Season",
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
              discountBadge: "Sports Deal",
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
              salesBadge: "Top Pick",
              isExpressEligible: true,
            },
          },
          featuredAttribute: {
            create: {
              featuredBadgeText: "সেরা স্পোর্টস গিয়ার",
              bannerImage: item.images[0],
              displayOrder: i + 1,
            },
          },
          newArrivalAttribute: {
            create: {
              badgeText: "New Season",
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

  console.log("🎉 Successfully seeded 6 Sports & Fitness Products!");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
