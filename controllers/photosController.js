const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const photosController = {
  async uploadPhotos(req, res) {
    try {
      console.log("Received Files:", req.files);
      const photoUrls = [];

      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: 'image' },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            stream.end(file.buffer);
          });

          console.log("Result:", result);
          photoUrls.push(result.secure_url);
        }
        console.log("Estas son las url que envia", photoUrls);

        return res.status(200).json({ urls: photoUrls });

      }


      return res.status(400).json({ message: "No files to upload" });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ message: 'Error uploading images', error });
    }
  },
};


module.exports = { uploadPhotos: photosController.uploadPhotos, upload };