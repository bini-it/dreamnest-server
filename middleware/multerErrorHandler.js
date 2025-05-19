import multer from 'multer';

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(400)
        .json({ message: 'File too large. Maximum size is 80KB.' });
    }
  } else if (err) {
    if (
      err.message === 'Invalid file type. Only JPEG and PNG files are allowed.'
    ) {
      return res.status(400).json({ message: err.message });
    }
  }
  next(err);
};

export default multerErrorHandler;
