// Bilingual (Bangla <-> English) Search Terms and Synonyms

const BILINGUAL_MAP: Record<string, string[]> = {
  // English to Bangla
  oil: ["তেল", "তৈল", "সয়াবিন", "সরিষা", "সোয়াবিন"],
  soybean: ["সয়াবিন", "সয়াবিন", "তেল"],
  mustard: ["সরিষা", "সরিষার", "তেল"],
  rice: ["চাল", "চিনিগুঁড়া", "চিনিগুড়া", "মিনিকেট", "সুগন্ধি"],
  chinigura: ["চিনিগুঁড়া", "চিনিগুড়া", "চাল"],
  miniket: ["মিনিকেট", "চাল"],
  ghee: ["ঘি", "গাওয়া"],
  honey: ["মধু"],
  tea: ["চা"],
  coffee: ["কফি"],
  sugar: ["চিনি"],
  salt: ["লবণ", "লবন"],
  turmeric: ["হলুদ", "হলুদের"],
  chili: ["মরিচ", "ঝাল"],
  spice: ["মসলা", "মশলা"],
  spices: ["মসলা", "মশলা"],
  masala: ["মসলা", "মশলা"],
  noodles: ["নুডলস", "নুডুলস", "ম্যাগি"],
  maggi: ["ম্যাগি", "নুডলস"],
  pasta: ["পাস্তা"],
  biscuit: ["বিস্কুট", "বিস্কিট", "কুকিজ"],
  biscuits: ["বিস্কুট", "বিস্কিট", "কুকিজ"],
  cookie: ["কুকিজ", "বিস্কুট"],
  milk: ["দুধ", "মিল্ক"],
  egg: ["ডিম"],
  eggs: ["ডিম"],
  dal: ["ডাল", "মসুর"],
  lentil: ["ডাল", "মসুর ডাল"],
  lentils: ["ডাল", "মসুর ডাল"],
  flour: ["আটা", "ময়দা", "ময়দা", "সুজি"],
  atta: ["আটা"],
  maida: ["ময়দা", "ময়দা"],
  suji: ["সুজি"],
  ginger: ["আদা"],
  garlic: ["রসুন"],
  onion: ["পেঁয়াজ", "পেঁয়াজ", "পিয়াজ"],
  potato: ["আলু"],
  soap: ["সাবান"],
  shampoo: ["শ্যাম্পু"],
  detergent: ["ডিটারজেন্ট", "হুইল"],
  water: ["পানি", "মিনারেল ওয়াটার"],
  juice: ["জুস", "শরবত"],
  fish: ["মাছ", "ইলিশ", "রুই"],
  meat: ["মাংস", "গোশত"],
  beef: ["গরু", "গরুর মাংস"],
  chicken: ["মুরগি", "চিকেন"],
  mutton: ["খাসি", "খাসির মাংস"],
  shirt: ["শার্ট", "টি-শার্ট"],
  tshirt: ["টি-শার্ট", "টিশার্ট", "শার্ট"],
  "t-shirt": ["টি-শার্ট", "টিশার্ট", "শার্ট"],
  pant: ["প্যান্ট"],
  pants: ["প্যান্ট"],
  shoe: ["জুতা", "জুতো"],
  shoes: ["জুতা", "জুতো"],
  watch: ["ঘড়ি", "ঘড়ি"],
  bag: ["ব্যাগ"],
  grocery: ["গ্রোসারি", "মুদি", "বাজার"],

  // Bangla to English + Bangla spelling variants
  "তেল": ["oil", "soybean", "mustard", "তৈল"],
  "তৈল": ["oil", "তেল"],
  "সয়াবিন": ["soybean", "oil", "সয়াবিন"],
  "সয়াবিন": ["soybean", "oil", "সয়াবিন"],
  "সরিষা": ["mustard", "oil", "সরিষার"],
  "সরিষার": ["mustard", "oil", "সরিষা"],
  "চাল": ["rice", "chinigura", "miniket"],
  "ভাত": ["rice", "চাল"],
  "চিনিগুঁড়া": ["chinigura", "rice", "চিনিগুড়া"],
  "চিনিগুড়া": ["chinigura", "rice", "চিনিগুঁড়া"],
  "মিনিকেট": ["miniket", "rice"],
  "ঘি": ["ghee"],
  "মধু": ["honey"],
  "চা": ["tea"],
  "কফি": ["coffee"],
  "চিনি": ["sugar"],
  "লবণ": ["salt", "লবন"],
  "লবন": ["salt", "লবণ"],
  "হলুদ": ["turmeric"],
  "মরিচ": ["chili"],
  "মসলা": ["spice", "spices", "masala", "মশলা"],
  "মশলা": ["spice", "spices", "masala", "মসলা"],
  "নুডলস": ["noodles", "maggi", "নুডুলস"],
  "নুডুলস": ["noodles", "maggi", "নুডলস"],
  "বিস্কুট": ["biscuit", "biscuits", "বিস্কিট", "কুকিজ"],
  "বিস্কিট": ["biscuit", "biscuits", "বিস্কুট"],
  "দুধ": ["milk", "dairy"],
  "ডিম": ["egg", "eggs"],
  "ডাল": ["dal", "lentil"],
  "আটা": ["atta", "flour"],
  "ময়দা": ["maida", "flour", "ময়দা"],
  "ময়দা": ["maida", "flour", "ময়দা"],
  "সুজি": ["suji", "flour"],
  "আদা": ["ginger"],
  "রসুন": ["garlic"],
  "পেঁয়াজ": ["onion", "পিয়াজ"],
  "পিয়াজ": ["onion", "পেঁয়াজ"],
  "আলু": ["potato"],
  "সাবান": ["soap"],
  "শ্যাম্পু": ["shampoo"],
  "মাছ": ["fish"],
  "মাংস": ["meat", "beef", "chicken", "mutton"],
  "মুরগি": ["chicken"],
  "খাসি": ["mutton"],
  "গরু": ["beef"],
  "শার্ট": ["shirt", "t-shirt"],
  "টি-শার্ট": ["t-shirt", "tshirt", "shirt"],
  "টিশার্ট": ["t-shirt", "tshirt", "shirt"],
  "জুতা": ["shoe", "shoes"],
  "জুতো": ["shoe", "shoes"],
  "ঘড়ি": ["watch", "ঘড়ি"],
  "ঘড়ি": ["watch", "ঘড়ি"],
  "ব্যাগ": ["bag"],
};

/**
 * Returns an array of search keywords expanded with bilingual translations
 * and common Bengali spelling alternates.
 */
export function getBilingualKeywords(rawSearch: string): string[] {
  let clean = rawSearch.trim().toLowerCase();
  if (!clean) return [];

  // Decode URI encoding if present
  try {
    let prev = "";
    while (clean !== prev && (clean.includes("%") || clean.includes("+"))) {
      prev = clean;
      clean = decodeURIComponent(clean.replace(/\+/g, " "));
    }
  } catch {
    // Keep as is
  }

  const keywords = new Set<string>();
  keywords.add(clean);

  // Split into tokens if multi-word
  const words = clean.split(/\s+/).filter(Boolean);
  for (const w of words) {
    keywords.add(w);
  }

  // Lookup in bilingual dictionary
  for (const term of [clean, ...words]) {
    const synonyms = BILINGUAL_MAP[term];
    if (synonyms) {
      for (const syn of synonyms) {
        keywords.add(syn.toLowerCase());
      }
    }
  }

  // Handle common Bengali spelling alternates (ন/ণ, স/শ/ষ, ড়/ড)
  for (const term of Array.from(keywords)) {
    if (term.includes("ন")) keywords.add(term.replace(/ন/g, "ণ"));
    if (term.includes("ণ")) keywords.add(term.replace(/ণ/g, "ন"));
    if (term.includes("শ")) keywords.add(term.replace(/শ/g, "স"));
    if (term.includes("স")) keywords.add(term.replace(/স/g, "শ"));
    if (term.includes("ড়")) keywords.add(term.replace(/ড়/g, "ড"));
    if (term.includes("ড")) keywords.add(term.replace(/ড/g, "ড়"));
  }

  return Array.from(keywords);
}
