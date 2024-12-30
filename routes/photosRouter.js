const express = require('express');
const {uploadPhotos, upload} = require('../controllers/photosController');


const photoRouter = express.Router();


photoRouter.post('/upload', upload.array('photos'), uploadPhotos);

module.exports = photoRouter;