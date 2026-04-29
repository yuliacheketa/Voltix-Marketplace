import { randomUUID } from "crypto";
import multer from "multer";
import { AVATARS_DIR } from "./user.avatarStorage";

const allowed = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

function extFromOriginal(name: string): string {
  const lower = name.toLowerCase();
  const i = lower.lastIndexOf(".");
  return i >= 0 ? lower.slice(i) : "";
}

export const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, AVATARS_DIR);
    },
    filename: (req, file, cb) => {
      const ext = extFromOriginal(file.originalname);
      const safe = allowed.has(ext) ? ext : ".jpg";
      cb(null, `${req.user!.userId}-${randomUUID()}${safe}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = extFromOriginal(file.originalname);
    if (!allowed.has(ext)) {
      cb(new Error("INVALID_AVATAR_TYPE"));
      return;
    }
    const ok = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype);
    if (!ok) {
      cb(new Error("INVALID_AVATAR_TYPE"));
      return;
    }
    cb(null, true);
  },
});
