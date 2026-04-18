import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ConceptArt from '../model/ConceptArtModel.js';

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const MB = 1024 * 1024;

const SIZE = {
  image: 5 * MB,
  video: 30 * MB,
  doc: 10 * MB,
};

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

const DOC_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/rtf',
  'text/markdown',
  'text/csv',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.presentation',
];
const DOC_EXTS = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx', '.rtf', '.md', '.csv', '.odt', '.odp'];

const fileFilter = async (req, file, cb) => {
  try {
    const { art_id } = req.params;

    if (!req._art) {
      req._art = await ConceptArt.getById(art_id);
    }

    if (!req._art) {
      return cb(new Error('Concept art not found'), false);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    const isImage = IMAGE_MIMES.includes(mime) && IMAGE_EXTS.includes(ext);
    const isVideo = VIDEO_MIMES.includes(mime) && VIDEO_EXTS.includes(ext);
    const isDoc = DOC_MIMES.includes(mime) && DOC_EXTS.includes(ext);

    if (req._art.category === 'post') {
      if (isImage || isVideo || isDoc) return cb(null, true);
      return cb(new Error('Invalid file type. Allowed: images, videos, or documents (PDF, DOC, DOCX, TXT, PPT, PPTX, RTF, MD, CSV, ODT, ODP)'), false);
    }

    if (isImage || isVideo) return cb(null, true);
    cb(new Error('Invalid file type. Allowed: images (PNG, JPG, WEBP, GIF, AVIF) or videos (MP4, WEBM, MOV, OGG)'), false);
  } catch (err) {
    cb(err, false);
  }
};

const storage = multer.diskStorage({

  destination: async (req, file, cb) => {
    try {
      const { art_id } = req.params;

      if (!art_id) {
        return cb(new Error('art_id is required for upload path'), null);
      }

      const art = req._art || await ConceptArt.getById(art_id);
      if (!art) {
        return cb(new Error('Concept art not found'), null);
      }

      const folderName = `${art_id}-${slugify(art.title)}`;
      const basePath = art.category === 'art' ? 'concept-art' : 'concept-posts';

      const folderPath = path.join(
        'assets',
        basePath,
        folderName
      );

      fs.mkdirSync(folderPath, { recursive: true });
      cb(null, folderPath);
    } catch (err) {
      cb(err, null);
    }
  },

  filename: (req, file, cb) => {
    const { art_id } = req.params;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();

    const filename = `${art_id}_${timestamp}${ext}`;

    cb(null, filename);
  }

});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: SIZE.video, files: 6 },
});

export default upload;
