import multer from 'multer';
import path from 'path';
import fs from 'fs';

const MB = 1024 * 1024;
const SIZE = { profile: 2 * MB };

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

  destination: (req, file, cb) => {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        return cb(new Error('Unauthenticated upload'), null);
      }

      const folderPath = path.join('assets', 'profiles', String(userId));
      fs.mkdirSync(folderPath, { recursive: true });
      cb(null, folderPath);
    } catch (err) {
      cb(err, null);
    }
  },

  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile_${timestamp}${ext}`);
  }

});

const uploadProfile = multer({
  storage,
  fileFilter,
  limits: { fileSize: SIZE.profile, files: 1 },
});

export default uploadProfile;
