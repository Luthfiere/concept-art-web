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

const allowedMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif'
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PNG, JPG, JPEG, WEBP, GIF'), false);
  }
};

const storage = multer.diskStorage({

  destination: async (req, file, cb) => {
    try {
      // On CREATE — title comes from req.body
      // On UPDATE — we look up the existing log title
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
        // On create, title must be in body
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
});

export default uploadDevLogCover;