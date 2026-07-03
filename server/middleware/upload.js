const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'skillsphere';
    let resourceType = 'auto';
    let allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];

    // Determine subfolder by mimetype
    if (file.mimetype.startsWith('image/')) {
      folder = 'skillsphere/images';
      resourceType = 'image';
      allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    } else if (file.mimetype === 'application/pdf') {
      folder = 'skillsphere/documents';
      resourceType = 'raw';
      allowedFormats = ['pdf'];
    }

    return {
      folder,
      resource_type: resourceType,
      allowed_formats: allowedFormats,
      transformation: file.mimetype.startsWith('image/')
        ? [{ width: 1200, crop: 'limit', quality: 'auto' }]
        : undefined,
    };
  },
});

// File filter: accept images and PDFs only
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only JPG, PNG, GIF, WEBP images and PDF files are allowed.'),
      false
    );
  }
};

// Base multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Resume storage — PDFs only
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillsphere/resumes',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
  },
});

const resumeUpload = multer({
  storage: resumeStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for resumes.'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Portfolio image storage
const portfolioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillsphere/portfolio',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
  },
});

const portfolioUpload = multer({
  storage: portfolioStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for portfolio.'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

/**
 * Upload a single file by field name
 * @param {string} fieldName
 */
const uploadSingle = (fieldName) => upload.single(fieldName);

/**
 * Upload multiple files by field name
 * @param {string} fieldName
 * @param {number} maxCount
 */
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

/**
 * Upload resume (PDF only)
 */
const uploadResume = resumeUpload.single('resume');

/**
 * Upload portfolio image
 */
const uploadPortfolio = portfolioUpload.single('portfolioImage');

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadResume,
  uploadPortfolio,
};
