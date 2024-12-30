const express = require('express');
const citiesController = require('../controllers/citiesController');


const citiesRouter = express.Router();


citiesRouter.get('/cities', citiesController.getCities);


module.exports = citiesRouter;