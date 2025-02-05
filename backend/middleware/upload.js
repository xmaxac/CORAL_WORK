import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // no larger than 5mb
  },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4|avi|mov)$/)) {
      return cb(new Error('Only image and video files are allowed!'), false);
    }
    cb(null, true)
  }
})

export default upload;