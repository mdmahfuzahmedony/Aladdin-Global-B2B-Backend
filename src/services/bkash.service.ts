
const BKASH_BASE_URL =
  process.env.BKASH_BASE_URL ||
  "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout";

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

type BkashTokenResponse = {
  id_token: string;
  refresh_token?: string;
  expires_in?: number;
};

type BkashCreateResponse = {
  paymentID: string;
  bkashURL: string;
  statusCode?: string;
  statusMessage?: string;
};

export type BkashTransactionResponse = {
  paymentID?: string;
  trxID?: string;
  transactionStatus?: string;
  amount?: string;
  currency?: string;
  intent?: string;
  merchantInvoiceNumber?: string;
  statusCode?: string;
  statusMessage?: string;
};

async function bkashRequest<T>(
  path: string,
  body: Record<string, unknown>,
  token?: string
): Promise<T> {
  const username = requiredEnv("BKASH_USERNAME");
  const password = requiredEnv("BKASH_PASSWORD");
  const appKey = requiredEnv("BKASH_APP_KEY");

  const response = await fetch(`${BKASH_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      username,
      password,
      "X-APP-Key": appKey,
      ...(token ? { Authorization: token } : {}),
    },
    body: JSON.stringify(body),
  });

  const raw = await response.text();

  let data: unknown;

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error("bKash returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(`bKash API request failed (${response.status}).`);
  }

  return data as T;
}

export async function getBkashToken(): Promise<BkashTokenResponse> {
  const result = await bkashRequest<BkashTokenResponse>(
    "/token/grant",
    {
      app_key: requiredEnv("BKASH_APP_KEY"),
      app_secret: requiredEnv("BKASH_APP_SECRET"),
    }
  );

  if (!result.id_token) {
    throw new Error("bKash access token was not returned.");
  }

  return result;
}

export async function createBkashPayment(input: {
  amount: string;
  invoiceNumber: string;
  callbackURL: string;
}) {
  const tokenData = await getBkashToken();

  const result = await bkashRequest<BkashCreateResponse>(
    "/payment/create",
    {
      mode: "0011",
      payerReference: input.invoiceNumber,
      callbackURL: input.callbackURL,
      amount: input.amount,
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: input.invoiceNumber,
    },
    tokenData.id_token
  );

  if (!result.paymentID || !result.bkashURL) {
    throw new Error("bKash did not return a payment ID or checkout URL.");
  }

  return {
    paymentId: result.paymentID,
    checkoutUrl: result.bkashURL,
  };
}

export async function executeBkashPayment(
  paymentId: string
): Promise<BkashTransactionResponse> {
  if (!paymentId?.trim()) {
    throw new Error("A valid bKash payment ID is required.");
  }

  const tokenData = await getBkashToken();

  return bkashRequest<BkashTransactionResponse>(
    "/payment/execute",
    { paymentID: paymentId },
    tokenData.id_token
  );
}

export async function queryBkashPayment(
  paymentId: string
): Promise<BkashTransactionResponse> {
  if (!paymentId?.trim()) {
    throw new Error("A valid bKash payment ID is required.");
  }

  const tokenData = await getBkashToken();

  return bkashRequest<BkashTransactionResponse>(
    "/payment/query",
    { paymentID: paymentId },
    tokenData.id_token
  );
}

export function verifyBkashTransaction(input: {
  result: BkashTransactionResponse;
  expectedPaymentId: string;
  expectedAmount: string;
  expectedInvoiceNumber: string;
}) {
  const { result } = input;

  // Compare money without floating-point arithmetic.
  const toPaisa = (value: string): bigint | null => {
    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
      return null;
    }

    const [whole, fraction = ""] = value.split(".");
    return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  };

  const actualAmount =
    typeof result.amount === "string" ? toPaisa(result.amount) : null;

  const expectedAmount = toPaisa(input.expectedAmount);

  return (
    result.paymentID === input.expectedPaymentId &&
    result.transactionStatus === "Completed" &&
    result.currency === "BDT" &&
    result.intent?.toLowerCase() === "sale" &&
    result.merchantInvoiceNumber === input.expectedInvoiceNumber &&
    actualAmount !== null &&
    expectedAmount !== null &&
    actualAmount === expectedAmount &&
    typeof result.trxID === "string" &&
    result.trxID.length > 0
  );
}
