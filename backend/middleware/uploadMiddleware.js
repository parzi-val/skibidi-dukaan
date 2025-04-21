const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig.js');
const { v4: uuidv4 } = require('uuid');

// Set up storage with Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'snacks', // Folder name in Cloudinary
        format: async (req, file) => 'png', // Convert all images to PNG
        public_id: (req, file) => {
            const nameWithoutExt = file.originalname.split('.')[0];
            const uniqueId = uuidv4();
            const finalName = `${nameWithoutExt}-${uniqueId}`;
        
            console.log('[UPLOAD DEBUG] File being uploaded:', {
                originalName: file.originalname,
                mimetype: file.mimetype,
                finalName,
            });
        
            return finalName;
        }
    }
});

const upload = multer({ storage });

module.exports = upload;
