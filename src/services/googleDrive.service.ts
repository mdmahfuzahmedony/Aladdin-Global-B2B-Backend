import { google } from "googleapis";
import { Readable } from "stream";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:6001/api/google/callback";

// ─── OAuth Client Factory ─────────────────────────────────────────────────────

export function createOAuthClient() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
  );
}

// ─── Generate Auth URL ────────────────────────────────────────────────────────

export function getAuthUrl(vendorId: string): string {
  const oauth2Client = createOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    state: vendorId, // pass vendorId through OAuth state
  });
}

// ─── Exchange Code for Tokens ─────────────────────────────────────────────────

export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiry: Date;
  email: string;
}> {
  const oauth2Client = createOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error("Failed to get OAuth tokens");
  }

  oauth2Client.setCredentials(tokens);

  // Get Google email
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data: userInfo } = await oauth2.userinfo.get();

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiry: new Date(tokens.expiry_date ?? Date.now() + 3600 * 1000),
    email: userInfo.email ?? "",
  };
}

// ─── Refresh Access Token ─────────────────────────────────────────────────────

export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiry: Date;
}> {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error("Failed to refresh access token");
  }

  return {
    accessToken: credentials.access_token,
    expiry: new Date(credentials.expiry_date ?? Date.now() + 3600 * 1000),
  };
}

// ─── Build Drive Client ───────────────────────────────────────────────────────

export function buildDriveClient(accessToken: string, refreshToken: string) {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.drive({ version: "v3", auth: oauth2Client });
}

// ─── Create Folder ────────────────────────────────────────────────────────────

export async function createDriveFolder(
  drive: ReturnType<typeof buildDriveClient>,
  name: string,
  parentId?: string,
): Promise<string> {
  const { data } = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : [],
    },
    fields: "id",
  });

  if (!data.id) throw new Error("Failed to create Drive folder");
  return data.id;
}

// ─── Find or Create Root Backup Folder ───────────────────────────────────────

export async function getOrCreateRootFolder(
  drive: ReturnType<typeof buildDriveClient>,
  folderName: string,
): Promise<string> {
  // Search for existing root folder
  const { data } = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (data.files && data.files.length > 0 && data.files[0].id) {
    return data.files[0].id;
  }

  // Create new root folder
  return createDriveFolder(drive, folderName);
}

// ─── Upload PDF Buffer ────────────────────────────────────────────────────────

export async function uploadPDFToDrive(
  drive: ReturnType<typeof buildDriveClient>,
  fileName: string,
  pdfBuffer: Buffer,
  parentFolderId: string,
): Promise<{ fileId: string; viewUrl: string }> {
  const readable = Readable.from(pdfBuffer);

  const { data } = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: "application/pdf",
      parents: [parentFolderId],
    },
    media: {
      mimeType: "application/pdf",
      body: readable,
    },
    fields: "id, webViewLink",
  });

  if (!data.id) throw new Error(`Failed to upload ${fileName}`);

  // Make file readable by anyone with the link (optional — vendor's drive so it's their data)
  await drive.permissions.create({
    fileId: data.id,
    requestBody: { role: "reader", type: "anyone" },
  });

  return {
    fileId: data.id,
    viewUrl:
      data.webViewLink ?? `https://drive.google.com/file/d/${data.id}/view`,
  };
}

// ─── Verify File Exists ───────────────────────────────────────────────────────

export async function verifyFileExists(
  drive: ReturnType<typeof buildDriveClient>,
  fileId: string,
): Promise<boolean> {
  try {
    const { data } = await drive.files.get({ fileId, fields: "id, trashed" });
    return !!data.id && !data.trashed;
  } catch {
    return false;
  }
}
