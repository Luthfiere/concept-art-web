// backend/middlewares/multerTutorialMedia.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Tutorial from '../model/TutorialModel.js';

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const MB = 1024 * 1024;
const SIZE = { image: 5 * MB, video: 50 * MB };

const IMAGE_MIMES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/avif',
];
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'];

const VIDEO_MIMES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
];
const VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.ogv', '.ogg'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  const isImage = IMAGE_MIMES.includes(mime) && IMAGE_EXTS.includes(ext);
  const isVideo = VIDEO_MIMES.includes(mime) && VIDEO_EXTS.includes(ext);

  if (isImage || isVideo) return cb(null, true);

  cb(new Error('Invalid file type. Allowed: images (PNG, JPG, WEBP, GIF, AVIF) or videos (MP4, WEBM, MOV, OGG)'), false);
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { tutorial_id } = req.params;
      if (!tutorial_id) {
        return cb(new Error('tutorial_id is required for upload path'), null);
      }

      const tutorial = req._tutorial || await Tutorial.getById(tutorial_id);
      req._tutorial = tutorial;

      if (!tutorial) {
        return cb(new Error('Tutorial not found'), null);
      }

      const folderName = `${tutorial_id}-${slugify(tutorial.title)}`;
      const folderPath = path.join('assets', 'tutorials', 'media', folderName);

      fs.mkdirSync(folderPath, { recursive: true });
      cb(null, folderPath);
    } catch (err) {
      cb(err, null);
    }
  },

  filename: (req, file, cb) => {
    const { tutorial_id } = req.params;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${tutorial_id}_${timestamp}${ext}`);
  }
});

const uploadTutorialMedia = multer({
  storage,
  fileFilter,
  limits: { fileSize: SIZE.video, files: 8 },
});

export default uploadTutorialMedia;