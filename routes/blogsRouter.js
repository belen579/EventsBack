const blogController = require('../controllers/blogController');
const express = require('express');
const blogsRouter = express.Router();


blogsRouter.post('/', blogController.blogRegister );
blogsRouter.get('/blogs', blogController.getBlogs);


module.exports = blogsRouter;