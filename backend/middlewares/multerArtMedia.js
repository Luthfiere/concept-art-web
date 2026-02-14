import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    const { art_id } = req.body;

    if (!art_id) {
      return cb(new Error('art_id is required for upload path'), null);
    }

    const folderPath = path.join(
      'assets',
      'concept-art',
      String(art_id)
    );

    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },

  filename: (req, file, cb) => {
    const { id } = req.body;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();

    const filename = `art_${id}_${timestamp}${ext}`;

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
  fileFilter,
});

export default upload;
