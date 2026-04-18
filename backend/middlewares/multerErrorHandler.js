import multer from 'multer';

const multerErrorHandler = (limitMB) => (err, req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: `File too large (max ${limitMB}MB per file)` });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files uploaded' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: `Unexpected field: ${err.field}` });
    }
    return res.status(400).json({ message: err.message });
  }

  return res.status(400).json({ message: err.message });
};

export default multerErrorHandler;
