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
const SIZE = { cover: 5 * MB };

const ALLOWED_MIMES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/avif',
];
const ALLOWED_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIMES.includes(file.mimetype) && ALLOWED_EXTS.includes(ext)) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Allowed: PNG, JPG, JPEG, WEBP, GIF, AVIF'), false);
};

const storage = multer.diskStorage({

  destination: async (req, file, cb) => {
    try {
      let folderName;

      const { id } = req.params;

      if (id) {
        const log = req._devLog || await DevLog.getById(id);
        req._devLog = log;

        if (!log) {
          return cb(new Error('Dev log not found'), null);
        }

        folderName = `${id}-${slugify(log.title)}`;
      } else {
        const title = req.body?.title || 'untitled';
        folderName = `new-${slugify(title)}-${Date.now()}`;
      }

      const folderPath = path.join('assets', 'dev-logs', 'covers', folderName);
      fs.mkdirSync(folderPath, { recursive: true });
      cb(null, folderPath);

    } catch (err) {
      cb(err, null);
    }
  },

  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `cover_${timestamp}${ext}`;
    cb(null, filename);
  }

});

const uploadDevLogCover = multer({
  storage,
  fileFilter,
  limits: { fileSize: SIZE.cover, files: 1 },
});

export default uploadDevLogCover;
