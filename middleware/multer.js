import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const VIDEO_MIME_TYPES = ['video/mp4', 'video/x-matroska', 'video/webm'];
const PDF_MIME_TYPES   = ['application/pdf'];

const MB = 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (VIDEO_MIME_TYPES.includes(file.mimetype)) {
      cb(null, 'uploads/videos/');
    } else if (PDF_MIME_TYPES.includes(file.mimetype)) {
      cb(null, 'uploads/pdfs/');
    } else {
      cb(new Error('Unsupported file type'), null);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [...VIDEO_MIME_TYPES, ...PDF_MIME_TYPES];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only mp4, mkv, webm, and pdf are allowed.'),
      false
    );
  }
};

export const upload = multer({ storage, fileFilter });

export const uploadSessionFile = (req, res, next) => {
  const singleUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 500 * MB }, 
  }).single('file');

  singleUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (req.file) {
      const isVideo = VIDEO_MIME_TYPES.includes(req.file.mimetype);
      const isPDF   = PDF_MIME_TYPES.includes(req.file.mimetype);

      if (isPDF && req.file.size > 20 * MB) {
        return res.status(400).json({ message: 'PDF file size must not exceed 20MB.' });
      }
      if (isVideo && req.file.size > 500 * MB) {
        return res.status(400).json({ message: 'Video file size must not exceed 500MB.' });
      }
    }

    next();
  });
};

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Thumbnail must be an image file.'), false);
  }
};

const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/thumbnails/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  },
});

export const uploadThumbnail = multer({
  storage: thumbnailStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * MB },
}).single('thumbnail');
