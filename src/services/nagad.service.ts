
import crypto from "crypto";

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getNagadConfig() {
  return {
    baseUrl: requiredEnv("NAGAD_BASE_URL").replace(/\/+$/, ""),
    merchantId: requiredEnv("NAGAD_MERCHANT_ID"),
    merchantNumber: requiredEnv("NAGAD_MERCHANT_NUMBER"),
    merchantPrivateKey: requiredEnv("NAGAD_MERCHANT_PRIVATE_KEY")
      .replace(/\\n/g, "\n"),
    gatewayPublicKey: requiredEnv("NAGAD_GATEWAY_PUBLIC_KEY")
      .replace(/\\n/g, "\n"),
    callbackUrl: requiredEnv("NAGAD_CALLBACK_URL"),
  };
}

export function createNagadOrderId(): string {
  // Unique identifier; keep within the length required by Nagad.
  return `NG${Date.now()}${crypto.randomBytes(3).toString("hex")}`
    .slice(0, 20);
}

export function signNagadPayload(payload: string): string {
  const config = getNagadConfig();

  return crypto
    .sign("RSA-SHA256", Buffer.from(payload, "utf8"), {
      key: config.merchantPrivateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    })
    .toString("base64");
}

export function verifyNagadSignature(
  payload: string,
  signature: string
): boolean {
  const config = getNagadConfig();

  return crypto.verify(
    "RSA-SHA256",
    Buffer.from(payload, "utf8"),
    {
      key: config.gatewayPublicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(signature, "base64")
  );
}
