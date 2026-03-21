const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../lib/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'learnova_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'mp4', 'docx', 'doc', 'webp'],
    resource_type: 'auto'
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
