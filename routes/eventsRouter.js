const express = require('express');
const eventController = require('../controllers/eventscontroller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const middlewares = require('../middlewares/middlewares');


const eventsRouter = express.Router();



eventsRouter.post('/eventregister', eventController.eventRegister);
eventsRouter.get('/events', eventController.getEvents);
eventsRouter.get('/events/:id', eventController.getEvent);
eventsRouter.post('/signup', middlewares.validateToken, eventController.signUpForEvent);
eventsRouter.patch('/editevent/:eventId', eventController.EditEvent);
eventsRouter.delete('/eventdelete/:eventId', eventController.deleteEvent);

module.exports = eventsRouter;