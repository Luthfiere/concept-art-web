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

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const fileFilter = async (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX'), false);
  }
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
});

export default uploadResume;
