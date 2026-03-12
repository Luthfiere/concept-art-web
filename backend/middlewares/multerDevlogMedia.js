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

// Dev logs support images, gifs, and short video clips
const allowedMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm'
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PNG, JPG, JPEG, WEBP, GIF, MP4, WEBM'), false);
  }
};

const storage = multer.diskStorage({

  destination: async (req, file, cb) => {
    try {
      const { log_id } = req.params;

      if (!log_id) {
        return cb(new Error('log_id is required for upload path'), null);
      }

      // Cache the log lookup so it only runs once for multi-file uploads
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
});

export default uploadDevLogMedia;