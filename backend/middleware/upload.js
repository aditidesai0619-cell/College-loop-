import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

export const UPLOAD_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Posters are stored on disk; only the URL path is saved in MongoDB
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) =>
    cb(null, `poster-${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname).toLowerCase()}`),
});

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) return cb(null, true);
  cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed'));
};

export const uploadPoster = multer({ storage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } }).single('poster');

export const removePoster = (posterPath) => {
  if (!posterPath) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(posterPath)), () => {});
};
