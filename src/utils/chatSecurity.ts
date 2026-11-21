/**
 * B2B Chat Platform Leakage & Security Protection Engine (Backend)
 * Detects and masks phone numbers, emails, social links, and flags suspicious offline keywords.
 */

const BENGALI_TO_ENG_DIGITS: Record<string, string> = {
  "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
  "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
};

export function normalizeBengaliDigits(text: string): string {
  return text.replace(/[০-৯]/g, (match) => BENGALI_TO_ENG_DIGITS[match] || match);
}

// Bangladesh mobile operators: 013, 014, 015, 016, 017, 018, 019
const PHONE_REGEX = /(?:\+?88\s?)?0\s?1\s?[3-9](?:[\s.-]?\d){8}/gi;

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

const SOCIAL_LINK_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:wa\.me|api\.whatsapp\.com|facebook\.com|fb\.com|m\.me|t\.me|telegram\.me|viber\.com)[\w/._?=&-]*/gi;

const SUSPICIOUS_KEYWORDS = [
  "বিকাশ",
  "নগদ",
  "রকেট",
  "উপায়",
  "bkash",
  "nagad",
  "rocket",
  "call me",
  "call din",
  "কল দিন",
  "ফোন দিন",
  "phone din",
  "whatsapp",
  "হোয়াটসঅ্যাপ",
  "হোয়াটসঅ্যাপ",
  "হোয়াটস্যাপ",
  "ব্যক্তিগতভাবে",
  "বাইরে ডিল",
  "অফলাইন ডিল",
  "ইনবক্স",
  "direct deal",
  "outside platform",
];

export interface MessageInspectionResult {
  cleanText: string;
  rawText?: string;
  hasSensitiveData: boolean;
  isSuspicious: boolean;
  suspiciousReasons: string[];
}

export function inspectAndSanitizeMessage(text: string): MessageInspectionResult {
  const reasons: string[] = [];
  let hasSensitive = false;
  let isSuspicious = false;

  const normalized = normalizeBengaliDigits(text);

  // 1. Phone number inspection
  if (PHONE_REGEX.test(normalized)) {
    hasSensitive = true;
    isSuspicious = true;
    reasons.push("সরাসরি ফোন নম্বর শেয়ারিং সনাক্ত হয়েছে");
  }

  // 2. Email inspection
  if (EMAIL_REGEX.test(text)) {
    hasSensitive = true;
    isSuspicious = true;
    reasons.push("ইমেইল অ্যাড্রেস শেয়ারিং সনাক্ত হয়েছে");
  }

  // 3. Social link inspection
  if (SOCIAL_LINK_REGEX.test(text)) {
    hasSensitive = true;
    isSuspicious = true;
    reasons.push("সোশ্যাল বা মেসেজিং লিংক শেয়ারিং সনাক্ত হয়েছে");
  }

  // 4. Offline / Suspicious keywords check
  const lowerText = text.toLowerCase();
  for (const kw of SUSPICIOUS_KEYWORDS) {
    if (lowerText.includes(kw.toLowerCase())) {
      isSuspicious = true;
      reasons.push(`সন্দেহজনক শব্দ সনাক্ত: "${kw}"`);
    }
  }

  // Masking
  let sanitized = text;

  // Mask links
  sanitized = sanitized.replace(SOCIAL_LINK_REGEX, "[🔒 বাহ্যিক লিঙ্ক লুকানো হয়েছে]");
  // Mask emails
  sanitized = sanitized.replace(EMAIL_REGEX, "[🔒 ইমেইল লুকানো হয়েছে]");

  // Mask BD phone numbers
  sanitized = sanitized.replace(
    /(?:\+?88\s?)?0\s?1\s?[3-9](?:[\s.-]?[0-9০-৯]){8}/gi,
    "[🔒 ফোন নম্বর লুকানো হয়েছে]"
  );

  return {
    cleanText: sanitized,
    rawText: hasSensitive || isSuspicious ? text : undefined,
    hasSensitiveData: hasSensitive,
    isSuspicious,
    suspiciousReasons: reasons,
  };
}
