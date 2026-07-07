import multer from 'multer';
import path from 'path';
import fs from 'fs';

const MB = 1024 * 1024;
const SIZE = { attachment: 10 * MB };

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'];
const CODE_EXTS = [
  '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.cs',
  '.html', '.css', '.json', '.sql', '.php', '.rb', '.go', '.rs',
  '.sh', '.yaml', '.yml', '.md',
];
const DOC_EXTS = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx', '.rtf', '.csv', '.odt', '.odp', '.zip', '.rar'];

export function resolveAttachmentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (IMAGE_EXTS.includes(ext)) return 'image';
  if (CODE_EXTS.includes(ext)) return 'code';
  if (DOC_EXTS.includes(ext)) return 'document';
  return null;
}

const fileFilter = (req, file, cb) => {
  const type = resolveAttachmentType(file.originalname);
  if (!type) {
    return cb(new Error('Unsupported attachment type'), false);
  }
  cb(null, true);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const { conversation_id } = req.params;
      const folderPath = path.join('assets', 'messages', String(conversation_id));
      fs.mkdirSync(folderPath, { recursive: true });
      cb(null, folderPath);
    } catch (err) {
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    const { conversation_id } = req.params;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${conversation_id}_${timestamp}${ext}`);
  },
});

const uploadMessageAttachment = multer({
  storage,
  fileFilter,
  limits: { fileSize: SIZE.attachment, files: 5 },
});

export default uploadMessageAttachment;