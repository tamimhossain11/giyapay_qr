import multer from 'multer';

const storage = multer.memoryStorage(); 

const fileFilter = (req, file, cb) => {
  const filetypes = /xls|xlsx/;
  const extname = filetypes.test(file.originalname.toLowerCase());
  if (extname) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files are allowed!'));
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter 
});

export default upload;
