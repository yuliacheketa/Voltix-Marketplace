import fs from "fs";
import path from "path";

export const AVATARS_DIR = path.join(process.cwd(), "uploads", "avatars");
export const AVATAR_PUBLIC_PREFIX = "/api/uploads/avatars/";

export function ensureAvatarsDir() {
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
}
