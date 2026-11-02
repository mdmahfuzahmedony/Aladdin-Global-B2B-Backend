import { supabaseAdmin } from "../config/supabase-admin";

const BUCKET =
  process.env.SUPABASE_MEDIA_BUCKET || "media";

console.log("=================================");
console.log("SUPABASE MEDIA BUCKET:", BUCKET);
console.log("=================================");

export const uploadToStorage = async (
  buffer: Buffer,
  path: string,
  contentType: string
) => {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
  };
};

export const deleteFromStorage = async (path: string) => {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};