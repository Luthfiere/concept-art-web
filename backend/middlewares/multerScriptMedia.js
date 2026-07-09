import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ScriptingQuestion from '../model/ScriptModel.js';

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const MB = 1024 * 1024;
const SIZE = { code: 2 * MB };

const ALLOWED_EXTS = [
  '.js', '.jsx', '.ts', '.tsx', '.cs', '.cpp', '.c', '.h', '.hpp',
  '.py', '.gd', '.java', '.lua', '.rb', '.php', '.json',
  '.shader', '.hlsl', '.glsl', '.txt',
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTS.includes(ext)) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Only code/script files are allowed (.js, .cs, .py, .gd, .cpp, etc.)'), false);
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { question_id } = req.params;
      if (!question_id) {
        return cb(new Error('question_id is required for upload path'), null);
      }

      const question = req._question || await ScriptingQuestion.getById(question_id);
      req._question = question;

      if (!question) {
        return cb(new Error('Scripting question not found'), null);
      }

      const folderName = `${question_id}-${slugify(question.title)}`;
      const folderPath = path.join('assets', 'scripting', 'files', folderName);

      fs.mkdirSync(folderPath, { recursive: true });
      cb(null, folderPath);
    } catch (err) {
      cb(err, null);
    }
  },

  filename: (req, file, cb) => {
    const { question_id } = req.params;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${question_id}_${timestamp}${ext}`);
  }
});

const uploadScriptingMedia = multer({
  storage,
  fileFilter,
  limits: { fileSize: SIZE.code, files: 3 },
});

export default uploadScriptingMedia;