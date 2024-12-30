const express = require('express');
const categoriesController = require('../controllers/categoriesController');

const categoresRouter = express.Router();


categoresRouter.get('/categories', categoriesController.getCategories);


module.exports = categoresRouter;
