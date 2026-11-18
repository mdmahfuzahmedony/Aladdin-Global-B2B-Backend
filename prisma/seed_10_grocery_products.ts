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

const VENDOR_ID = "c6e19de5-e318-4d34-aada-fd04eb283827"; // APPROVED Vendor

interface ProductSeedItem {
  title: string;
  sku: string;
  slug: string;
  shortDescription: string;
  descriptionHtml: string;
  stockQuantity: number;
  categoryName: string;
  regularPrice: number;
  salePrice: number;
  flashSalePrice: number;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  unitsSold: number;
}

const productsToSeed: ProductSeedItem[] = [
  {
    title: "রুপচাঁদা খাঁটি সয়াবিন তেল (৫ লিটার)",
    sku: "GROC-OIL-RUP-5L",
    slug: "rupchanda-fortified-soybean-oil-5l",
    shortDescription: "ভিটামিন এ ও ডি সমৃদ্ধ বিশুদ্ধ ভোজ্য সয়াবিন তেল - ৫ লিটার পেট বোতল।",
    descriptionHtml: `
      <h3>রুপচাঁদা ফর্টিফাইড সয়াবিন তেলের বিস্তারিত বিবরণ</h3>
      <p>রুপচাঁদা ফর্টিফাইড সয়াবিন তেল বাংলাদেশের এক নম্বর বিশ্বস্ত ভোজ্য তেল। এটি ভিটামিন এ এবং ডি সমৃদ্ধ যা পরিবারের দৈনন্দিন পুষ্টি ও রোগ প্রতিরোধ ক্ষমতা বাড়াতে অত্যন্ত কার্যকর।</p>
      <h4>মূল বৈশিষ্ট্য ও সুবিধাসমূহ:</h4>
      <ol>
        <li>১০০% খাঁটি ও সর্বোচ্চ মানের পরিশোধিত সয়াবিন তেল।</li>
        <li>ভিটামিন 'এ' এবং 'ডি' সমৃদ্ধ যা চোখের দৃষ্টি ও হাড়ের সুরক্ষায় সহায়ক।</li>
        <li>জিরো কোলেস্টেরল ও হার্টের জন্য অত্যন্ত স্বাস্থ্যকর।</li>
        <li>রান্নার আসল স্বাদ এবং স্বাভাবিক বর্ণ অটুট রাখে।</li>
      </ol>
      <p><strong>প্যাকেজিং সাইজ:</strong> ৫ লিটার জার</p>
      <p><strong>সংরক্ষণ:</strong> সরাসরি সূর্যালোক থেকে দূরে ঠাণ্ডা ও শুষ্ক স্থানে সংরক্ষণ করুন।</p>
    `,
    stockQuantity: 120,
    categoryName: "Oil",
    regularPrice: 920,
    salePrice: 870,
    flashSalePrice: 820,
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewsCount: 142,
    unitsSold: 460,
  },
  {
    title: "চাষী প্রিমিয়াম চিনিগুঁড়া সুগন্ধি চাল (২ কেজি)",
    sku: "GROC-RICE-CHA-2K",
    slug: "chashi-premium-chinigura-rice-2kg",
    shortDescription: "পোলাও, বিরিয়ানি ও পায়েসের জন্য প্রিমিয়াম দানার খাঁটি সুগন্ধি চিনিগুঁড়া চাল।",
    descriptionHtml: `
      <h3>চাষী চিনিগুঁড়া সুগন্ধি চালের বিবরণ</h3>
      <p>উৎকৃষ্ট মানের সুগন্ধি ধানের সোনালী শীষ থেকে বাছাইকৃত চাষী চিনিগুঁড়া চাল উৎসবের আনন্দকে বাড়িয়ে দেয় বহুগুণ। প্রতিটি দানাই সমান ও মনমাতানো সুবাসে ভরপুর।</p>
      <h4>বিশেষ গুণাগুণ:</h4>
      <ol>
        <li>মনোরম সুবাস এবং ঝরঝরে রান্নার নিশ্চয়তা।</li>
        <li>পোলাও, বিরিয়ানি, ফিরনি, পায়েস ও খিচুড়ির জন্য সেরা পছন্দ।</li>
        <li>আধুনিক প্রযুক্তিতে অটোমেটিক মেশিনে পরিশোধিত ও প্যাকেজড।</li>
        <li>পাথর, গুঁড়ো ও ধুলামুক্ত ১০০% পরিষ্কার দানা।</li>
      </ol>
      <p><strong>নেট ওজন:</strong> ২ কেজি</p>
    `,
    stockQuantity: 150,
    categoryName: "Rice",
    regularPrice: 320,
    salePrice: 295,
    flashSalePrice: 280,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    rating: 5.0,
    reviewsCount: 98,
    unitsSold: 380,
  },
  {
    title: "প্রাণ খাঁটি সরিষার তেল (১ লিটার)",
    sku: "GROC-OIL-PRN-MUS-1L",
    slug: "pran-pure-mustard-oil-1l",
    shortDescription: "ঝাঁঝালো ঘ্রাণ ও অতুলনীয় স্বাদের আসল কোল্ড-প্রেসড সরিষার তেল।",
    descriptionHtml: `
      <h3>প্রাণ পিওর সরিষার তেলের বৈশিষ্ট্য</h3>
      <p>ঘানিভাঙা খাঁটি সরিষার আসল ঝাঁঝ ও প্রাকৃতিক পুষ্টিগুণ ধরে রাখতে প্রাণ সরিষার তেল অতুলনীয়। ভর্তা, ভাজি ও ঐতিহ্যবাহী আচার তৈরির অপরিহার্য সঙ্গী।</p>
      <h4>প্রধান সুবিধাসমূহ:</h4>
      <ol>
        <li>বাছাইকৃত শ্রেষ্ঠ সরিষা দানা থেকে তৈরি।</li>
        <li>প্রাকৃতিক ঝাঁঝালো স্বাদ ও চমৎকার সোনালী রঙ।</li>
        <li>ওমেগা-৩ ও ওমেগা-৬ ফ্যাটি অ্যাসিড সমৃদ্ধ।</li>
        <li>কোনো প্রকার কেমিক্যাল বা কৃত্রিম রঙ মিশ্রণ ছাড়া সম্পূর্ণ প্রাকৃতিক।</li>
      </ol>
      <p><strong>পরিমাণ:</strong> ১ লিটার বোতল</p>
    `,
    stockQuantity: 95,
    categoryName: "Oil",
    regularPrice: 310,
    salePrice: 285,
    flashSalePrice: 265,
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewsCount: 76,
    unitsSold: 290,
  },
  {
    title: "মিল্ক ভিটা খাঁটি গাওয়া ঘি (৪০০ গ্রাম)",
    sku: "GROC-GHE-MVT-400G",
    slug: "milk-vita-pure-cow-ghee-400g",
    shortDescription: "খাঁটি গরুর দুধের ননীর সুবাসিত দানাদার খাঁটি গাওয়া ঘি।",
    descriptionHtml: `
      <h3>মিল্ক ভিটা গাওয়া ঘিয়ের পরিচিতি</h3>
      <p>গ্রাম বাংলার খামারিদের খাঁটি গরুর দুধ থেকে প্রস্তুত ঐতিহ্যবাহী মিল্ক ভিটা ঘি। মুখরোচক খাবার, বিরিয়ানি ও গরম ভাতের সাথে অনন্য স্বাদ এনে দেয়।</p>
      <h4>গুণগত মান:</h4>
      <ol>
        <li>১০০% খাঁটি গরুর দুধের ক্রিম থেকে তৈরি।</li>
        <li>চমৎকার দানাদার টেক্সচার ও প্রাকৃতিক সুবাস।</li>
        <li>শারীরিক শক্তি ও রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি করে।</li>
        <li>বিএসটিআই এবং হালাল সনদপ্রাপ্ত নির্ভরযোগ্য পণ্য।</li>
      </ol>
      <p><strong>ওজন:</strong> ৪০০ গ্রাম মেটাল জার</p>
    `,
    stockQuantity: 80,
    categoryName: "Ghee",
    regularPrice: 580,
    salePrice: 540,
    flashSalePrice: 499,
    imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewsCount: 115,
    unitsSold: 410,
  },
  {
    title: "ড্যানিশ সুইটেন্ড কন্ডেন্সড মিল্ক (৩৯৭ গ্রাম)",
    sku: "GROC-DAI-DAN-397G",
    slug: "danish-sweetened-condensed-milk-397g",
    shortDescription: "চা, কফি, মিষ্টি ও বিভিন্ন ডেজার্ট রান্নার সেরা কন্ডেন্সড মিল্ক।",
    descriptionHtml: `
      <h3>ড্যানিশ কন্ডেন্সড মিল্কের বিস্তারিত</h3>
      <p>দুধের সমৃদ্ধ স্বাদ ও মিষ্টতায় তৈরি ড্যানিশ কন্ডেন্সড মিল্ক। এক কাপ চা বা কফির স্বাদ অনন্য করে তুলতে অথবা যেকোনো মিষ্টি ও পায়েস রান্নায় এটি নিখুঁত।</p>
      <h4>বৈশিষ্ট্য:</h4>
      <ol>
        <li>ঘন, মসৃণ ও সুস্বাদু ক্রিমি টেক্সচার।</li>
        <li>চা, কফি, আইসক্রিম, পুডিং ও ফ্রুট সালাদের জন্য আদর্শ।</li>
        <li>ক্যালসিয়াম ও ভিটামিন সমৃদ্ধ পুষ্টিকর দুধ।</li>
        <li>সহজে খোলার জন্য ইজি-ওপেন ক্যান ডিজাইন।</li>
      </ol>
      <p><strong>ওজন:</strong> ৩৯৭ গ্রাম ক্যান</p>
    `,
    stockQuantity: 200,
    categoryName: "Dairy",
    regularPrice: 105,
    salePrice: 95,
    flashSalePrice: 88,
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviewsCount: 65,
    unitsSold: 320,
  },
  {
    title: "ইস্পাহানি মির্জাপুর সেরা ব্লেন্ড চা (৪০০ গ্রাম)",
    sku: "GROC-TEA-ISP-400G",
    slug: "ispahani-mirzapore-best-blend-tea-400g",
    shortDescription: "সতেজতা ও চমৎকার লিকারের অনন্য স্বাদযুক্ত প্রিমিয়াম চা পাতা।",
    descriptionHtml: `
      <h3>ইস্পাহানি মির্জাপুর সেরা ব্লেন্ড চায়ের গুণাবলী</h3>
      <p>বাংলাদেশের সেরা চা বাগানগুলোর কচি পাতা দিয়ে তৈরি ইস্পাহানি মির্জাপুর চা। এর প্রতিটি চুমুকে রয়েছে অতুলনীয় স্বাদ, মন মাতানো ঘ্রাণ এবং খাঁটি সতেজতা।</p>
      <h4>বিশেষ সুবিধাসমূহ:</h4>
      <ol>
        <li>অনন্য লিকার ও কড়া মনমাতানো ফ্লেভার।</li>
        <li>ক্লান্তি দূর করে তাৎক্ষণিক ফ্রেশনেস প্রদান করে।</li>
        <li>বিশেষভাবে ব্লেন্ডেড হাই-গ্রেড ব্ল্যাক টি পাতা।</li>
        <li>বাতাসরোধী ফয়েল প্যাকেজিংয়ে সতেজতা দীর্ঘস্থায়ী থাকে।</li>
      </ol>
      <p><strong>ওজন:</strong> ৪০০ গ্রাম প্যাক</p>
    `,
    stockQuantity: 180,
    categoryName: "Tea & Coffee",
    regularPrice: 250,
    salePrice: 230,
    flashSalePrice: 215,
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewsCount: 160,
    unitsSold: 520,
  },
  {
    title: "ম্যাগি ২-মিনিট মাসালা নুডলস (৮ প্যাক ফ্যামিলি প্যাক)",
    sku: "GROC-NOD-MAG-8PK",
    slug: "maggi-2-minute-masala-noodles-8pack",
    shortDescription: "ঝটপট পুষ্টিকর ও সুস্বাদু নাস্তার জন্য ক্লাসিক মসলা নুডলস।",
    descriptionHtml: `
      <h3>ম্যাগি ২-মিনিট মাসালা নুডলসের বিবরণ</h3>
      <p>ছোট-বড় সবার পছন্দের ম্যাগি নুডলস। ক্যালসিয়াম ও আয়রন সমৃদ্ধ ম্যাগি মাত্র ২ মিনিটেই তৈরি করা যায় এবং বিকেলে বা অফিসের নাস্তায় এনে দেয় দারুণ তৃপ্তি।</p>
      <h4>প্রধান বৈশিষ্ট্য:</h4>
      <ol>
        <li>আসল ভারতীয় ও দেশীয় মসলার ব্যালেন্সড স্বাদের ম্যাজিক টেস্টমেকার।</li>
        <li>আয়রন ও ভিটামিন সমৃদ্ধ স্বাস্থ্যকর গম দিয়ে তৈরি।</li>
        <li>মাত্র ২ থেকে ৩ মিনিটে সহজে রান্নাযোগ্য।</li>
        <li>৮টি আলাদা প্যাকের বাজেট ফ্রেন্ডলি ফ্যামিলি বান্ডেল।</li>
      </ol>
      <p><strong>প্যাক সাইজ:</strong> ৮ প্যাক বান্ডেল</p>
    `,
    stockQuantity: 250,
    categoryName: "Noodles & Pasta",
    regularPrice: 180,
    salePrice: 165,
    flashSalePrice: 150,
    imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewsCount: 210,
    unitsSold: 640,
  },
  {
    title: "রাঁধুনী গুঁড়া হলুদ (২০০ গ্রাম)",
    sku: "GROC-SPI-RAD-TUR-200G",
    slug: "radhuni-pure-turmeric-powder-200g",
    shortDescription: "নিখুঁত উজ্জ্বল রঙ ও খাঁটি ঝাঁঝযুক্ত রান্নার সেরা প্রাকৃতিক হলুদ গুঁড়া।",
    descriptionHtml: `
      <h3>রাঁধুনী খাঁটি হলুদ গুঁড়ার পরিচিতি</h3>
      <p>বাছাইকৃত সেরা কাঁচা হলুদ শুকিয়ে স্বয়ংক্রিয় মেশিনে গুঁড়ো করে প্রস্তুত করা হয় রাঁধুনী হলুদ গুঁড়া। তরকারিতে দেয় প্রাকৃতিক সোনালী হলুদ রঙ ও চমৎকার স্বাদ।</p>
      <h4>উপকারিতা ও বৈশিষ্ট্য:</h4>
      <ol>
        <li>১০০% খাঁটি ও কারকিউমিন সমৃদ্ধ প্রাকৃতিক হলুদ।</li>
        <li>কোনো প্রকার কৃত্রিম রঙ বা ক্ষতিকর কেমিক্যাল মিশ্রণমুক্ত।</li>
        <li>প্রাকৃতিক অ্যান্টিঅক্সিডেন্ট ও অ্যান্টি-ইনফ্ল্যামেটরি গুণসম্পন্ন।</li>
        <li>রান্নার রঙ ও ঘ্রাণকে করে তোলে দারুণ আকর্ষণীয়।</li>
      </ol>
      <p><strong>ওজন:</strong> ২০০ গ্রাম পলি প্যাক</p>
    `,
    stockQuantity: 140,
    categoryName: "Spices",
    regularPrice: 125,
    salePrice: 110,
    flashSalePrice: 98,
    imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewsCount: 88,
    unitsSold: 350,
  },
  {
    title: "এসিআই পিওর আয়োডিনযুক্ত ভ্যাকুয়াম লবণ (১ কেজি)",
    sku: "GROC-SLT-ACI-1K",
    slug: "aci-pure-vacuum-salt-1kg",
    shortDescription: "১০০% পিওর, ঝরঝরে ও প্রয়োজনীয় আয়োডিনযুক্ত স্বাস্থ্যসম্মত সাদা লবণ।",
    descriptionHtml: `
      <h3>এসিআই পিওর লবণের স্বাস্থ্যগুণ</h3>
      <p>ভ্যাকুয়াম বাষ্পীভবন প্রযুক্তিতে পরিশোধিত এসিআই পিওর সল্ট। এতে রয়েছে সঠিক মাত্রায় আয়োডিন যা শিশুদের শারীরিক ও মানসিক বিকাশ এবং গলগণ্ড রোগ প্রতিরোধে অপরিহার্য।</p>
      <h4>বৈশিষ্ট্য:</h4>
      <ol>
        <li>১০০% ধবধবে সাদা, শুকনো ও সহজে গলে যাওয়া ঝরঝরে ক্রিস্টাল।</li>
        <li>বিশ্ব স্বাস্থ্য সংস্থার নির্ধারিত পরিমিত আয়োডিন সমৃদ্ধ।</li>
        <li>ধুলাবালি ও অপ্রয়োজনীয় ক্ষতিকর খনিজ মুক্ত সম্পূর্ণ স্বাস্থ্যকর।</li>
        <li>সব ধরনের রান্নায় সঠিক স্বাদ বজায় রাখে।</li>
      </ol>
      <p><strong>ওজন:</strong> ১ কেজি প্যাক</p>
    `,
    stockQuantity: 300,
    categoryName: "Salt & Sugar",
    regularPrice: 45,
    salePrice: 42,
    flashSalePrice: 38,
    imageUrl: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=800&q=80",
    rating: 5.0,
    reviewsCount: 95,
    unitsSold: 710,
  },
  {
    title: "অলিম্পিক এনার্জি প্লাস বিস্কুট (ফ্যামিলি প্যাক)",
    sku: "GROC-BIS-OLY-ENG-FP",
    slug: "olympic-energy-plus-biscuits-family-pack",
    shortDescription: "গ্লুকোজ ও পুষ্টিগুণে ভরপুর ক্রিস্পি ও সুস্বাদু চা-এর মিষ্টি বিস্কুট।",
    descriptionHtml: `
      <h3>অলিম্পিক এনার্জি প্লাস বিস্কুটের বিবরণ</h3>
      <p>সকাল বা বিকেলের চায়ের সাথে পরিবারের সবার প্রিয় মুচমুচে এনার্জি প্লাস বিস্কুট। কাজের ফাঁকে শরীরে আনে দ্রুত শক্তি ও বাড়তি সতেজতা।</p>
      <h4>মূল সুবিধাসমূহ:</h4>
      <ol>
        <li>পুষ্টিকর উপাদান ও গ্লুকোজ সমৃদ্ধ যা দেয় দ্রুত এনার্জি।</li>
        <li>অনবদ্য ক্রিস্পি টেক্সচার ও মিষ্টি মধুর ক্লাসিক স্বাদ।</li>
        <li>চা, কফি অথবা দুধের সাথে খাওয়ার জন্য পারফেক্ট নাস্তা।</li>
        <li>ফ্যামিলি প্যাকের দারুণ সাশ্রয়ী সাইজ।</li>
      </ol>
      <p><strong>প্যাকেট সাইজ:</strong> ফ্যামিলি প্যাক</p>
    `,
    stockQuantity: 220,
    categoryName: "Biscuits & Cookies",
    regularPrice: 90,
    salePrice: 80,
    flashSalePrice: 72,
    imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewsCount: 130,
    unitsSold: 580,
  },
];

async function main() {
  console.log("🌱 Starting 10 Grocery Products Seeding...");

  // Category map cache
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
  });
  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    categoryMap.set(cat.name.toLowerCase(), cat.id);
  }

  // Flash sale timer boundaries (active from 1 day ago to 30 days ahead)
  const flashSaleStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const flashSaleEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // New arrivals timer boundaries
  const newArrivalStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newArrivalEnd = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < productsToSeed.length; i++) {
    const item = productsToSeed[i];
    const categoryId = categoryMap.get(item.categoryName.toLowerCase());
    if (!categoryId) {
      console.warn(`⚠️ Category '${item.categoryName}' not found. Falling back to first category.`);
    }
    const finalCategoryId = categoryId || categories[0].id;

    // Check if product exists by SKU or slug
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

    if (existing) {
      console.log(`🔄 Updating existing product: ${item.title} (${item.slug})`);
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          title: item.title,
          shortDescription: item.shortDescription,
          description: item.descriptionHtml.trim(),
          stockQuantity: item.stockQuantity,
          images: [item.imageUrl],
          categoryId: finalCategoryId,
          vendorId: VENDOR_ID,
        },
      });

      // Update or create Pricing
      await prisma.productPricing.upsert({
        where: { productId: existing.id },
        create: {
          productId: existing.id,
          customerRegularPrice: item.regularPrice,
          customerSalePrice: item.salePrice,
          sellerRegularPrice: item.regularPrice * 0.85,
          sellerSalePrice: item.salePrice * 0.85,
          affiliateCommissionType: "PERCENTAGE",
          affiliateCommissionValue: 5,
        },
        update: {
          customerRegularPrice: item.regularPrice,
          customerSalePrice: item.salePrice,
        },
      });

      // Update or create Flash Sale
      await prisma.flashSaleAttribute.upsert({
        where: { productId: existing.id },
        create: {
          productId: existing.id,
          flashSalePrice: item.flashSalePrice,
          flashSaleStock: Math.round(item.stockQuantity * 0.6),
          soldCount: Math.round(item.unitsSold * 0.2),
          startTime: flashSaleStart,
          endTime: flashSaleEnd,
          discountBadge: "Hot Deal",
        },
        update: {
          flashSalePrice: item.flashSalePrice,
          startTime: flashSaleStart,
          endTime: flashSaleEnd,
        },
      });

      // Update or create Top Rated
      await prisma.topRatedAttribute.upsert({
        where: { productId: existing.id },
        create: {
          productId: existing.id,
          averageRating: item.rating,
          totalReviews: item.reviewsCount,
          reviewSnippet: "১০০% খাঁটি ও ফ্রেশ কোয়ালিটি গ্রোসারি আইটেম।",
        },
        update: {
          averageRating: item.rating,
          totalReviews: item.reviewsCount,
        },
      });

      // Update or create Top Seller
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

      // Update or create Featured
      await prisma.featuredAttribute.upsert({
        where: { productId: existing.id },
        create: {
          productId: existing.id,
          featuredBadgeText: "Featured Grocery",
          bannerImage: item.imageUrl,
          displayOrder: i + 1,
        },
        update: {
          featuredBadgeText: "Featured Grocery",
          displayOrder: i + 1,
        },
      });

      // Update or create New Arrival
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
    } else {
      console.log(`✨ Creating product: ${item.title} (${item.slug})`);
      const newProduct = await prisma.product.create({
        data: {
          title: item.title,
          sku: item.sku,
          slug: item.slug,
          shortDescription: item.shortDescription,
          description: item.descriptionHtml.trim(),
          stockQuantity: item.stockQuantity,
          images: [item.imageUrl],
          categoryId: finalCategoryId,
          vendorId: VENDOR_ID,
          pricing: {
            create: {
              customerRegularPrice: item.regularPrice,
              customerSalePrice: item.salePrice,
              sellerRegularPrice: item.regularPrice * 0.85,
              sellerSalePrice: item.salePrice * 0.85,
              affiliateCommissionType: "PERCENTAGE",
              affiliateCommissionValue: 5,
            },
          },
          flashSaleAttribute: {
            create: {
              flashSalePrice: item.flashSalePrice,
              flashSaleStock: Math.round(item.stockQuantity * 0.6),
              soldCount: Math.round(item.unitsSold * 0.2),
              startTime: flashSaleStart,
              endTime: flashSaleEnd,
              discountBadge: "Hot Deal",
            },
          },
          topRatedAttribute: {
            create: {
              averageRating: item.rating,
              totalReviews: item.reviewsCount,
              reviewSnippet: "১০০% খাঁটি ও ফ্রেশ কোয়ালিটি গ্রোসারি আইটেম।",
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
              featuredBadgeText: "Featured Grocery",
              bannerImage: item.imageUrl,
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

  console.log("🎉 All 10 Grocery Products successfully seeded and mapped to all home placements!");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
