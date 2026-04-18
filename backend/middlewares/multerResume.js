import multer from 'multer';
import path from 'path';
import fs from 'fs';
import JobPosting from '../model/JobPostingModel.js';

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const MB = 1024 * 1024;
const SIZE = { resume: 2 * MB };

const ALLOWED_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXTS = ['.pdf', '.doc', '.docx'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIMES.includes(file.mimetype) && ALLOWED_EXTS.includes(ext)) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX'), false);
};

const storage = multer.diskStorage({

  destination: async (req, file, cb) => {
    try {
      const { job_id } = req.params;

      if (!job_id) {
        return cb(new Error('job_id is required for upload path'), null);
      }

      const job = req._job || await JobPosting.getById(job_id);
      req._job = job;

      if (!job) {
        return cb(new Error('Job posting not found'), null);
      }

      const folderName = `${slugify(job.title)}_${job_id}`;
      const folderPath = path.join('assets', 'resumes', folderName);

      fs.mkdirSync(folderPath, { recursive: true });
      cb(null, folderPath);
    } catch (err) {
      cb(err, null);
    }
  },

  filename: (req, file, cb) => {
    const { user_id } = req.user;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();

    const filename = `${user_id}_${timestamp}${ext}`;
    cb(null, filename);
  }

});

const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: SIZE.resume, files: 1 },
});

export default uploadResume;
