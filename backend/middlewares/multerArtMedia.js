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

const storage = multer.diskStorage({

  destination: async (req, file, cb) => {
    try {
      const { art_id } = req.params;

      if (!art_id) {
        return cb(new Error('art_id is required for upload path'), null);
      }

      const art = await ConceptArt.getById(art_id);
      if (!art) {
        return cb(new Error('Concept art not found'), null);
      }

      const folderName = `${art_id}-${slugify(art.title)}`;

      const folderPath = path.join(
        'assets',
        'concept-art',
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

    const filename = `art_${art_id}_${timestamp}${ext}`;

    cb(null, filename);
  }

});

const fileFilter = (req, file, cb) => {

  const allowedMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    // future support
    'video/mp4',
    'video/webm'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only PNG, JPG, JPEG, MP4, WEBM allowed.'),
      false
    );
  }
};

const upload = multer({
  storage,
});

export default upload;
