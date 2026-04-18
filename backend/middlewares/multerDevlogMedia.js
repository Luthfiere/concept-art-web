import multer from 'multer';
import path from 'path';
import fs from 'fs';
import DevLog from '../model/DevlogModel.js';

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const MB = 1024 * 1024;
const SIZE = { media: 30 * MB };

const ALLOWED_MIMES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/avif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
];
const ALLOWED_EXTS = [
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif',
  '.mp4', '.webm', '.mov', '.ogv', '.ogg',
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIMES.includes(file.mimetype) && ALLOWED_EXTS.includes(ext)) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Allowed: images (PNG, JPG, WEBP, GIF, AVIF) or videos (MP4, WEBM, MOV, OGG)'), false);
};

const storage = multer.diskStorage({

  destination: async (req, file, cb) => {
    try {
      const { log_id } = req.params;

      if (!log_id) {
        return cb(new Error('log_id is required for upload path'), null);
      }

      const log = req._devLog || await DevLog.getById(log_id);
      req._devLog = log;

      if (!log) {
        return cb(new Error('Dev log not found'), null);
      }

      const folderName = `${log_id}-${slugify(log.title)}`;
      const folderPath = path.join('assets', 'dev-logs', 'media', folderName);

      fs.mkdirSync(folderPath, { recursive: true });
      cb(null, folderPath);

    } catch (err) {
      cb(err, null);
    }
  },

  filename: (req, file, cb) => {
    const { log_id } = req.params;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${log_id}_${timestamp}${ext}`;
    cb(null, filename);
  }

});

const uploadDevLogMedia = multer({
  storage,
  fileFilter,
  limits: { fileSize: SIZE.media, files: 8 },
});

export default uploadDevLogMedia;
