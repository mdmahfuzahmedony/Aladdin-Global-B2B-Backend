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

const gadgetProductsToSeed: ProductSeedItem[] = [
  // =========================================================================
  // 1. Xiaomi Redmi Note 13 (8GB / 256GB)
  // =========================================================================
  {
    title: "শাওমি রেডমি নোট ১৩ (৮জিবি র‍্যাম / ২৫৬জিবি রম) - ১২০Hz AMOLED | Xiaomi Redmi Note 13",
    sku: "GAD-XIA-RN13-8-256",
    slug: "xiaomi-redmi-note-13-8gb-256gb-amoled-official",
    shortDescription:
      "১০৮ মেগাপিক্সেল ট্রিপল ক্যামেরা, ১২০ হার্জ আল্ট্রা-স্মুথ অ্যামোলেড ডিসপ্লে এবং ৩৩ ওয়াট ফাস্ট চার্জিং সহ অফিসিয়াল শাওমি রেডমি নোট ১৩ স্মার্টফোন।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">শাওমি রেডমি নোট ১৩ পরিচিতি ও স্পেসিফিকেশন:</h3>
  <p>
    <strong>রেডমি নোট ১৩ (Redmi Note 13)</strong> আধুনিক স্মার্টফোন ব্যবহারকারীদের জন্য সেরা পারফরম্যান্স ও প্রিমিয়াম ডিজাইনের অসাধারণ সমন্বয়। এর 6.67 ইঞ্চি Full HD+ AMOLED ডিসপ্লে আপনাকে দেবে ১২০Hz রিফ্রেশ রেটের চমৎকার ভিজ্যুয়াল অভিজ্ঞতা।
  </p>
  <div class="my-4 rounded-xl bg-sky-50/70 p-4 border border-sky-200">
    <h4 class="font-bold text-sky-900 text-sm mb-1">হাইলাইটেড স্পেসিফিকেশন ও ফিচার:</h4>
    <ul class="list-disc pl-5 text-xs text-sky-800 space-y-1">
      <li><strong>ডিসপ্লে:</strong> ৬.৬৭ ইঞ্চি আল্ট্রা-স্লিম বেজেল AMOLED ডিসপ্লে (১২০Hz রিফ্রেশ রেট)</li>
      <li><strong>ক্যামেরা:</strong> ১০৮ মেগাপিক্সেল মেইন ও ৮ মেগাপিক্সেল আল্ট্রা-ওয়াইড ট্রিপল ক্যামেরা</li>
      <li><strong>মেমোরি:</strong> ৮ জিবি এলপিডিডিআর৪এক্স র‍্যাম এবং ২৫৬ জিবি ইন্টারনাল স্টোরেজ</li>
      <li><strong>ব্যাটারি ও চার্জিং:</strong> ৫০০০ এমএএইচ বিশাল ব্যাটারি ও বক্সে ৩৩ ওয়াট টার্বো ফাস্ট চার্জার</li>
      <li><strong>প্রসেসর:</strong> কোয়ালকম স্ন্যাপড্রাগন ৬৮৫ অক্টা-কোর শক্তিশালী প্রসেসর</li>
      <li><strong>নিরাপত্তা:</strong> ইন-ডিসপ্লে ফিঙ্গারপ্রিন্ট সেন্সর ও ফেস আনলক</li>
    </ul>
  </div>
  <p>
    <strong>ওয়ারেন্টি:</strong> অফিসিয়াল ১ বছরের ব্র্যান্ড ওয়ারেন্টি এবং পার্টস রিপ্লেসমেন্ট সুবিধা।
  </p>
</div>
`,
    stockQuantity: 45,
    categorySlugOrName: "Mobile & Tablet",
    regularPrice: 22999,
    salePrice: 21499,
    flashSalePrice: 19999,
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 185,
    unitsSold: 940,
    reviewSnippet: "ডিসপ্লে কোয়ালিটি এবং ক্যামেরার ছবি এক কথায় অসাধারণ! চার্জ ব্যাকআপও সারাদিন থাকে।",
    attributes: {
      deviceType: "Smartphone / স্মার্টফোন",
      brand: "Xiaomi / Redmi",
      modelName: "Redmi Note 13 (8GB/256GB)",
      ram: "8 GB",
      storage: "256 GB",
      screenSize: '6.67" FHD+ AMOLED 120Hz',
      batteryCapacity: "5000 mAh Li-Po",
      operatingSystem: "Android 14 / HyperOS",
      connectivity: "4G VoLTE + Dual Band Wi-Fi",
      chargingPower: "33W Turbo Charge",
      colorVariant: "Midnight Black / Ocean Sunset",
      warranty: "Official 1 Year Brand Warranty",
      countryOfOrigin: "Bangladesh (মেইড ইন বাংলাদেশ)",
      customSpecs: [
        { id: "spec_1", label: "ক্যামেরা রেজোলিউশন", value: "108MP 3X In-Sensor Zoom Triple Camera" },
        { id: "spec_2", label: "প্রসেসর চিপসেট", value: "Snapdragon 685 Octa-Core (6nm)" },
        { id: "spec_3", label: "ওয়াটার রেজিস্ট্যান্স", value: "IP54 Splash & Dust Resistant" },
      ],
    },
  },

  // =========================================================================
  // 2. HP Pavilion 15 Core i5 13th Gen (16GB RAM / 512GB SSD)
  // =========================================================================
  {
    title: "এইচপি প্যাভিলিয়ন ১৫ কোর আই৫ ১৩তম জেনারেশন (১৬জিবি র‍্যাম / ৫১২জিবি এসএসডি) | HP Pavilion 15",
    sku: "GAD-HP-PAV15-I5-13TH",
    slug: "hp-pavilion-15-core-i5-13th-gen-16gb-512gb-ssd",
    shortDescription:
      "ইন্টেল কোর আই৫ ১৩তম প্রজন্মের ১০-কোর প্রসেসর, ১৬জিবি ডিডিআর৪ র‍্যাম, সুপারফাস্ট এনভিএমই ৫১২জিবি এসএসডি এবং মেটাল ফিনিশ সমৃদ্ধ অফিস ও ফ্রিল্যান্সিং ল্যাপটপ।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">এইচপি প্যাভিলিয়ন ১৫ পরিচিতি ও ফিচার:</h3>
  <p>
    <strong>HP Pavilion 15</strong> ল্যাপটপটি স্টুডেন্ট, কর্পোরেট এক্সিকিউটিভ ও ফ্রিল্যান্সারদের হাই-স্পিড মাল্টিটাস্কিংয়ের জন্য বিশেষভাবে ডিজাইন করা হয়েছে। এর প্রিমিয়াম অ্যালুমিনিয়াম ফিনিশ ও দীর্ঘস্থায়ী ব্যাটারি ব্যাকআপ যেকোনো জায়গায় কাজ করার সেরা স্বাধীনতা দেয়।
  </p>
  <div class="my-4 rounded-xl bg-blue-50/70 p-4 border border-blue-200">
    <h4 class="font-bold text-blue-900 text-sm mb-1">প্রধান টেকনিক্যাল স্পেসিফিকেশন:</h4>
    <ul class="list-disc pl-5 text-xs text-blue-800 space-y-1">
      <li><strong>প্রসেসর:</strong> Intel Core i5-1335U (13th Gen, 10 Cores, 12 Threads, Up to 4.60 GHz)</li>
      <li><strong>র‍্যাম:</strong> 16 GB DDR4 3200MHz Dual Channel RAM</li>
      <li><strong>স্টোরেজ:</strong> 512 GB PCIe NVMe M.2 Ultra-Fast SSD</li>
      <li><strong>ডিসপ্লে:</strong> 15.6 Inch Full HD (1920x1080) Micro-Edge IPS Anti-Glare</li>
      <li><strong>গ্রাফিক্স:</strong> Intel Iris Xe Graphics</li>
      <li><strong>অডিও:</strong> Audio by B&O Dual Stereo Speakers</li>
      <li><strong>কানেক্টিভিটি:</strong> Wi-Fi 6 (2x2), Bluetooth 5.3, USB Type-C 10Gbps with Power Delivery</li>
    </ul>
  </div>
</div>
`,
    stockQuantity: 20,
    categorySlugOrName: "Laptop & Computer",
    regularPrice: 84000,
    salePrice: 79500,
    flashSalePrice: 76000,
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 92,
    unitsSold: 310,
    reviewSnippet: "বুট হতে মাত্র ৪ সেকেন্ড লাগে! কোডিং ও অফিস কাজের জন্য এক কথায় সুপার ফাস্ট ল্যাপটপ।",
    attributes: {
      deviceType: "Laptop / ল্যাপটপ",
      brand: "HP",
      modelName: "Pavilion 15-eg3000ne (13th Gen Core i5)",
      ram: "16 GB",
      storage: "512 GB SSD",
      screenSize: '15.6" FHD IPS Anti-Glare',
      batteryCapacity: "3-Cell 45Wh (Laptop)",
      operatingSystem: "Windows 11 Home / Pro",
      connectivity: "Wi-Fi 6 + Bluetooth 5.3",
      chargingPower: "65W Type-C PD (Laptop)",
      colorVariant: "Natural Silver Aluminum",
      warranty: "Official 2 Years Comprehensive",
      countryOfOrigin: "China",
      customSpecs: [
        { id: "spec_1", label: "প্রসেসর", value: "Intel Core i5-1335U (10 Cores, Up to 4.6 GHz)" },
        { id: "spec_2", label: "কীবোর্ড", value: "Full-size Backlit Keyboard with Numpad" },
        { id: "spec_3", label: "স্পিকার সাউন্ড", value: "B&O Dual High Definition Stereo Audio" },
      ],
    },
  },

  // =========================================================================
  // 3. Haylou Solar Plus RT3 AMOLED Smartwatch
  // =========================================================================
  {
    title: "হেইলু সোলার প্লাস আরটি৩ ব্লুটুথ কলিং স্মার্টওয়াচ - ১.৪৩\" AMOLED ডিসপ্লে | Haylou Solar Plus RT3",
    sku: "GAD-HAY-RT3-BLK",
    slug: "haylou-solar-plus-rt3-amoled-smartwatch-calling",
    shortDescription:
      "১.৪৩ ইঞ্চি আল্ট্রা-রেটিনা অ্যামোলেড ডিসপ্লে, ক্লিয়ার ব্লুটুথ ফোন কলিং, হার্ট রেট ও SpO2 হেলথ ট্র্যাকিং এবং IP68 ওয়াটারপ্রুফ স্মার্টওয়াচ।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">হেইলু সোলার প্লাস আরটি৩ স্মার্টওয়াচ বিবরণ:</h3>
  <p>
    <strong>হেইলু আরটি৩ (Haylou RT3)</strong> প্রিমিয়াম মেটালিক বেজেল এবং উজ্জ্বল 466x466 পিক্সেলের AMOLED ডিসপ্লে সমৃদ্ধ স্মার্টওয়াচ। সরাসরি ঘড়ি থেকেই ফোন কল রিসিভ এবং কথা বলার সুবিধা থাকায় দৈনন্দিন জীবনে এটি অত্যন্ত সুবিধাজনক।
  </p>
  <div class="my-4 rounded-xl bg-indigo-50/70 p-4 border border-indigo-200">
    <h4 class="font-bold text-indigo-900 text-sm mb-1">স্মার্ট ওয়াচের মূল ফিচারসমূহ:</h4>
    <ul class="list-disc pl-5 text-xs text-indigo-800 space-y-1">
      <li>১.৪৩ ইঞ্চি AMOLED সার্কুলার কার্ভড গ্লাস ডিসপ্লে (Always-on Display)</li>
      <li>স্মার্ট ব্লুটুথ ফোন কলিং (হ্যান্ডস-ফ্রি ক্রিস্টাল ক্লিয়ার মাইক্রোফোন ও স্পিকার)</li>
      <li>১০৫ টিরও বেশি ডেডিকেটেড স্পোর্টস মোড ও ফিটনেস ট্র্যাকিং</li>
      <li>সার্বক্ষণিক হার্ট রেট, রক্তে অক্সিজেনের মাত্রা (SpO2) ও ঘুম মনিটরিং</li>
      <li>IP68 সার্টিফাইড ওয়াটার ও ডাস্ট রেজিস্ট্যান্ট</li>
      <li>স্বাভাবিক ব্যবহারে টানা ৭ দিনের দীর্ঘস্থায়ী ব্যাটারি লাইফ</li>
    </ul>
  </div>
</div>
`,
    stockQuantity: 80,
    categorySlugOrName: "Mobile, Tablet Accessories",
    regularPrice: 4200,
    salePrice: 3450,
    flashSalePrice: 2999,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 140,
    unitsSold: 850,
    reviewSnippet: "ডিসপ্লেটা খুব ব্রাইট ও রোদেও পরিষ্কার দেখা যায়। ব্লুটুথ কলিং সাউন্ড কোয়ালিটি খুব ভালো।",
    attributes: {
      deviceType: "Smartwatch / ব্যান্ড",
      brand: "Haylou",
      modelName: "Solar Plus RT3 (LS16)",
      ram: "N/A (প্রযোজ্য নয়)",
      storage: "N/A (প্রযোজ্য নয়)",
      screenSize: '1.4" AMOLED (Smartwatch)',
      batteryCapacity: "300 mAh (Smartwatch)",
      operatingSystem: "RTOS / Custom OS",
      connectivity: "Bluetooth 5.3 + Dual Pairing",
      chargingPower: "Magnetic Wireless / Pin Charging",
      colorVariant: "Space Black with Silicone Strap",
      warranty: "Official 1 Year Brand Warranty",
      countryOfOrigin: "China",
      customSpecs: [
        { id: "spec_1", label: "ওয়াটারপ্রুফ রেটিং", value: "IP68 Professional Waterproof" },
        { id: "spec_2", label: "ডিসপ্লে রেজোলিউশন", value: "466 x 466 Pixels Always-on AMOLED" },
        { id: "spec_3", label: "ফিচারসমূহ", value: "Bluetooth Calling, SpO2, Heart Rate, 105 Sports Modes" },
      ],
    },
  },

  // =========================================================================
  // 4. Anker Soundcore R50i TWS Earbuds
  // =========================================================================
  {
    title: "অ্যাংকার সাউন্ডকোর আর৫০আই ট্রু ওয়্যারলেস ইয়ারবাডস - ৩০ ঘণ্টা প্লেব্যাক | Anker Soundcore R50i",
    sku: "GAD-ANK-R50I-WHT",
    slug: "anker-soundcore-r50i-true-wireless-earbuds-bass",
    shortDescription:
      "১০ মিমি এক্সট্রা-বাস ড্রাইভার, AI ক্রিস্টাল ক্লিয়ার কলিং, ৩০ ঘণ্টার বিশাল ব্যাকআপ ও ফাস্ট চার্জিং সুবিধা সহ প্রিমিয়াম কোয়ালিটির ট্রু ওয়্যারলেস ইয়ারবাডস।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">সাউন্ডকোর আর৫০আই ইয়ারবাডস পরিচিতি:</h3>
  <p>
    বিশ্ববিখ্যাত অডিও ব্র্যান্ড <strong>Anker Soundcore</strong> এর জনপ্রিয় মডেল R50i। এর 10mm কাস্টম ড্রাইভার আপনাকে দেবে ডিপ বেস এবং অত্যন্ত স্পষ্ট ভোকাল।
  </p>
  <div class="my-4 rounded-xl bg-purple-50/70 p-4 border border-purple-200">
    <h4 class="font-bold text-purple-900 text-sm mb-1">প্রধান অডিও ফিচারসমূহ:</h4>
    <ul class="list-disc pl-5 text-xs text-purple-800 space-y-1">
      <li><strong>সাউন্ড:</strong> ১০ মিমি পাওয়ারফুল কম্পোজিট ড্রাইভার ও ২২টি প্রি-সেট ইকুয়ালাইজার</li>
      <li><strong>ব্যাটারি লাইফ:</strong> এক চার্জে ১০ ঘণ্টা প্লেব্যাক, কেস সহ মোট ৩০ ঘণ্টা</li>
      <li><strong>ফাস্ট চার্জ:</strong> মাত্র ১০ মিনিট চার্জে টানা ২ ঘণ্টা গান শুনার ব্যাকআপ</li>
      <li><strong>কলিং কোয়ালিটি:</strong> AI নয়েজ রিডাকশন সহ ২-মাইক্রোফোন সিস্টেম</li>
      <li><strong>সুরক্ষা:</strong> IPX5 ওয়াটার ও ঘাম প্রতিরোধক সার্টিফিকেশন</li>
    </ul>
  </div>
</div>
`,
    stockQuantity: 120,
    categorySlugOrName: "Consumer Electronics",
    regularPrice: 2400,
    salePrice: 1850,
    flashSalePrice: 1690,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 260,
    unitsSold: 1450,
    reviewSnippet: "বেস কোয়ালিটি সেরা! সাউন্ডকোর অ্যাপ দিয়ে EQ টিউন করা যায়। এই বাজেটে এর চেয়ে ভালো বাডস নেই।",
    attributes: {
      deviceType: "TWS / Earbuds / হেডফোন",
      brand: "Anker / Soundcore",
      modelName: "Soundcore R50i (A3949)",
      ram: "N/A (প্রযোজ্য নয়)",
      storage: "N/A (প্রযোজ্য নয়)",
      screenSize: "N/A (প্রযোজ্য নয়)",
      batteryCapacity: "500 mAh (Earbuds Case)",
      operatingSystem: "Soundcore App Supported (Android/iOS)",
      connectivity: "Bluetooth 5.3 + Dual Pairing",
      chargingPower: "10 Mins Fast Charge = 2 Hours Play",
      colorVariant: "Classic White / Deep Black",
      warranty: "Official 18 Months Replacement Warranty",
      countryOfOrigin: "China",
      customSpecs: [
        { id: "spec_1", label: "ড্রাইভার সাইজ", value: "10mm Extra-Bass Drivers" },
        { id: "spec_2", label: "প্লেব্যাক সময়", value: "10 Hours Earbuds, 30 Hours with Case" },
        { id: "spec_3", label: "ওয়াটারপ্রুফ রেটিং", value: "IPX5 Sweat & Splash Proof" },
      ],
    },
  },

  // =========================================================================
  // 5. Remax 20000mAh 22.5W Fast Charging Power Bank
  // =========================================================================
  {
    title: "রেম্যাক্স ২০,০০০ এমএএইচ ২২.৫ ওয়াট ফাস্ট চার্জিং পাওয়ার ব্যাংক - এলইডি ডিজিটাল ডিসপ্লে | Remax RPP-292",
    sku: "GAD-RMX-RPP292-20K",
    slug: "remax-20000mah-22-5w-fast-charging-power-bank-rpp-292",
    shortDescription:
      "২২.৫ ওয়াট সুপার ফাস্ট চার্জিং, ডিজিটাল ব্যাটারি পার্সেন্টেজ ডিসপ্লে এবং ৩টি আউটপুট পোর্ট সহ ২০,০০০ এমএএইচ লং-লাস্টিং পলিমার পাওয়ার ব্যাংক।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">রেম্যাক্স ২০,০০০ mAh পাওয়ার ব্যাংক বিবরণ:</h3>
  <p>
    <strong>Remax RPP-292</strong> ভ্রমণ কিংবা বিদ্যুৎ না থাকা সময়ে স্মার্টফোন, ট্যাবলেট ও গ্যাজেটস নিরবচ্ছিন্ন চার্জ রাখার জন্য নির্ভরযোগ্য সমাধান। এর রিয়েল ২০,০০০ mAh পলিমার ব্যাটারি যেকোনো স্মার্টফোনকে ৪-৫ বার সম্পূর্ণ চার্জ করতে পারে।
  </p>
  <div class="my-4 rounded-xl bg-amber-50/70 p-4 border border-amber-200">
    <h4 class="font-bold text-amber-900 text-sm mb-1">পাওয়ার ব্যাংকের প্রধান সুবিধাসমূহ:</h4>
    <ul class="list-disc pl-5 text-xs text-amber-800 space-y-1">
      <li><strong>ক্যাপাসিটি:</strong> ২০,০০০ মিলিঅ্যাম্পিয়ার আওয়ার (20,000 mAh Li-Polymer)</li>
      <li><strong>আউটপুট:</strong> ২২.৫W সুপার ফাস্ট চার্জিং ও টাইপ-সি PD 20W টু-ওয়ে ফাস্ট চার্জ</li>
      <li><strong>ডিসপ্লে:</strong> স্পষ্ট এলইডি ডিজিটাল স্ক্রিনে ব্যাটারির চার্জের শতাংশ প্রদর্শন</li>
      <li><strong>মাল্টি-পোর্ট:</strong> একসাথে ৩টি ডিভাইসে একই সাথে দ্রুত চার্জ দেওয়ার সুবিধা</li>
      <li><strong>সুরক্ষা:</strong> ওভার-চার্জ, ওভার-ভোল্টেজ ও শর্ট-সার্কিট মাল্টি-লেয়ার প্রটেকশন</li>
    </ul>
  </div>
</div>
`,
    stockQuantity: 95,
    categorySlugOrName: "Mobile, Tablet Accessories",
    regularPrice: 2200,
    salePrice: 1650,
    flashSalePrice: 1480,
    images: [
      "https://images.unsplash.com/photo-1609592807908-1e1b427a1c5d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.8,
    reviewsCount: 115,
    unitsSold: 670,
    reviewSnippet: "ডিজিটাল ডিসপ্লেতে স্পষ্ট দেখা যায় কত শতাংশ চার্জ বাকি আছে। ফোন খুব দ্রুত চার্জ হয়।",
    attributes: {
      deviceType: "Power Bank / পাওয়ার ব্যাংক",
      brand: "Remax",
      modelName: "RPP-292 20000mAh Power Box",
      ram: "N/A (প্রযোজ্য নয়)",
      storage: "N/A (প্রযোজ্য নয়)",
      screenSize: "LED Digital Display Indicator",
      batteryCapacity: "20000 mAh (Power Bank)",
      operatingSystem: "N/A (প্রযোজ্য নয়)",
      connectivity: "Dual USB-A Output + Type-C PD In/Out",
      chargingPower: "22.5W SuperVOOC & PD 20W Fast Charge",
      colorVariant: "Midnight Blue / Pure White",
      warranty: "6 Months Service Warranty",
      countryOfOrigin: "China",
      customSpecs: [
        { id: "spec_1", label: "আউটপুট পোর্ট", value: "2x USB-A (22.5W Max) + 1x Type-C (20W PD)" },
        { id: "spec_2", label: "ইনপুট পোর্ট", value: "Type-C (18W PD) + Micro USB Fast Input" },
        { id: "spec_3", label: "ব্যাটারি টাইপ", value: "High-Density Grade A+ Lithium Polymer" },
      ],
    },
  },

  // =========================================================================
  // 6. Walton 43 Inch 4K UHD Smart Google TV
  // =========================================================================
  {
    title: "ওয়ালটন ৪৩ ইঞ্চি ৪কে আল্ট্রা এইচডি গুগল ভয়েস কন্ট্রোল স্মার্ট টিভি | Walton 43\" 4K Smart TV",
    sku: "GAD-WLT-43TV-4K-GGL",
    slug: "walton-43-inch-4k-uhd-smart-google-tv-w43g60uhd",
    shortDescription:
      "অফিসিয়াল গুগল টিভি ওএস, ক্রোমকাস্ট বিল্ট-ইন, ডলবি অডিও সাউন্ড এবং ফ্রেমলেস ৪কে আল্ট্রা এইচডি ডিসপ্লে সহ ওয়ালটন ৪৩ ইঞ্চি স্মার্ট টেলিভিশন।",
    descriptionHtml: `
<div class="space-y-4 text-slate-700 leading-relaxed">
  <h3 class="text-lg font-bold text-slate-900 border-b pb-2">ওয়ালটন ৪৩ ইঞ্চি ৪কে গুগল টিভির বিবরণ:</h3>
  <p>
    <strong>Walton 43" 4K Google TV (W43G60UHD)</strong> আপনার ঘরের লিভিং রুমের বিনোদনকে নিয়ে যাবে অন্য মাত্রায়। অফিসিয়াল গুগল টিভি ইন্টারফেসে নেটফ্লিক্স, ইউটিউব, প্রাইম ভিডিও ও গুগল প্লে স্টোর উপভোগ করুন সহজে।
  </p>
  <div class="my-4 rounded-xl bg-rose-50/70 p-4 border border-rose-200">
    <h4 class="font-bold text-rose-900 text-sm mb-1">টেলিভিশনের প্রধান বৈশিষ্ট্য ও স্পেক্স:</h4>
    <ul class="list-disc pl-5 text-xs text-rose-800 space-y-1">
      <li><strong>স্ক্রিন:</strong> ৪৩ ইঞ্চি 4K Ultra HD (৩৮৪০ x ২১৬০ পিক্সেল) বেজেললেস ডিজাইন</li>
      <li><strong>অপারেটিং সিস্টেম:</strong> অফিসিয়াল Google TV (লাইসেন্সড অ্যান্ড্রয়েড ১১)</li>
      <li><strong>মেমোরি:</strong> ২ জিবি হাই-স্পিড র‍্যাম ও ১৬ জিবি ইন্টারনাল স্টোরেজ</li>
      <li><strong>সাউন্ড:</strong> ২০ ওয়াট পাওয়ারফুল ডলবি ডিজিটাল প্লাস স্টেরিও স্পিকার</li>
      <li><strong>ভয়েস কন্ট্রোল:</strong> গুগল অ্যাসিস্ট্যান্ট রিমোট দিয়ে মুখে বাংলায় কথা বলেই চ্যানেল বা ভিডিও খোঁজার সুবিধা</li>
      <li><strong>কানেক্টিভিটি:</strong> ৩টি HDMI, ২টি USB পোর্ট, ডুয়াল ব্যান্ড ওয়াই-ফাই ও ব্লুটুথ ৫.১</li>
    </ul>
  </div>
</div>
`,
    stockQuantity: 15,
    categorySlugOrName: "Consumer Electronics",
    regularPrice: 38900,
    salePrice: 34500,
    flashSalePrice: 32900,
    images: [
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=800&q=80",
    ],
    rating: 4.9,
    reviewsCount: 78,
    unitsSold: 220,
    reviewSnippet: "পিকচার কোয়ালিটি ৪কে রেজোলিউশনে অসাধারণ এবং সাউন্ড খুব লাউড ও ক্রিস্টাল ক্লিয়ার।",
    attributes: {
      deviceType: "Smart TV / টেলিভিশন",
      brand: "Walton",
      modelName: "W43G60UHD Google TV",
      ram: "2 GB",
      storage: "16 GB",
      screenSize: '43" 4K Ultra HD Smart TV',
      batteryCapacity: "Direct AC Power (কর্ডযুক্ত)",
      operatingSystem: "Google TV (Licensed Android 11)",
      connectivity: "Dual Band Wi-Fi, Bluetooth 5.1, 3x HDMI, 2x USB",
      chargingPower: "N/A",
      colorVariant: "Frameless Black Metal Bezel",
      warranty: "Official 5 Years Panel Warranty",
      countryOfOrigin: "Bangladesh (মেইড ইন বাংলাদেশ)",
      customSpecs: [
        { id: "spec_1", label: "ডিসপ্লে রেজোলিউশন", value: "3840 x 2160 Pixels (4K HDR10)" },
        { id: "spec_2", label: "অডিও সাউন্ড", value: "20W Dolby Digital Plus Stereo" },
        { id: "spec_3", label: "ভয়েস রিমোট", value: "Google Assistant Voice Search Remote Included" },
      ],
    },
  },
];

async function main() {
  console.log("🌱 Starting Seeding Gadgets & Electronics Products...");

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

  for (let i = 0; i < gadgetProductsToSeed.length; i++) {
    const item = gadgetProductsToSeed[i];

    // Find category
    let targetCat = allCategories.find(
      (c) =>
        c.name.toLowerCase() === item.categorySlugOrName.toLowerCase() ||
        c.slug.toLowerCase().includes(item.categorySlugOrName.toLowerCase())
    );

    if (!targetCat) {
      targetCat = allCategories.find(
        (c) =>
          c.name.toLowerCase().includes("electronic") ||
          c.name.toLowerCase().includes("gadget") ||
          c.name.toLowerCase().includes("mobile")
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
                discountBadge: "Gadget Deal",
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
                featuredBadgeText: "জনপ্রিয় গ্যাজেট",
                bannerImage: item.images[0],
                displayOrder: i + 1,
              },
              update: {
                featuredBadgeText: "জনপ্রিয় গ্যাজেট",
                bannerImage: item.images[0],
                displayOrder: i + 1,
              },
            },
          },
          newArrivalAttribute: {
            upsert: {
              create: {
                badgeText: "New Gadget",
                displayOrder: i + 1,
                startDate: newArrivalStart,
                endDate: newArrivalEnd,
              },
              update: {
                badgeText: "New Gadget",
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
              discountBadge: "Gadget Deal",
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
              featuredBadgeText: "জনপ্রিয় গ্যাজেট",
              bannerImage: item.images[0],
              displayOrder: i + 1,
            },
          },
          newArrivalAttribute: {
            create: {
              badgeText: "New Gadget",
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

  console.log("🎉 Successfully seeded 6 Gadget & Electronics Products!");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
