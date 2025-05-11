import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4|avi|mov|doc|docx|html|odt|pdf|xls|xlsx|ppt|pptx|txt|csv|zip)$/)) {
      return cb(new Error('Only image and video and document files are allowed!'), false);
    }
    cb(null, true)
  }
})

export default upload;