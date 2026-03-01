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

// Image and video types for 'art' category
const artMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'video/mp4',
  'video/webm'
];

// Document types for 'post' category
const postMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

const fileFilter = async (req, file, cb) => {
  try {
    const { art_id } = req.params;

    // Query once and cache on req so destination doesn't query again
    if (!req._art) {
      req._art = await ConceptArt.getById(art_id);
    }

    if (!req._art) {
      return cb(new Error('Concept art not found'), false);
    }

    const allowed = req._art.category === 'post' ? postMimeTypes : artMimeTypes;

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const types = req._art.category === 'post'
        ? 'PDF, DOC, DOCX, TXT, PPT, PPTX'
        : 'PNG, JPG, JPEG, WEBP, MP4, WEBM';
      cb(new Error(`Invalid file type for ${req._art.category}. Allowed: ${types}`), false);
    }
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

      // Reuse the lookup from fileFilter
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
});

export default upload;
