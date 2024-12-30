const express = require('express');

const { validateToken } = require('../middlewares/middlewares');
const groupController = require('../controllers/groupController');
const { getUsers } = require('../controllers/userscontroller');

const groupRouter = express.Router();

groupRouter.post('/create', validateToken, groupController.create);
groupRouter.post('/eraseall', validateToken, groupController.eraseAll);
groupRouter.get('/showall', validateToken, groupController.showAll);
/* groupRouter.get('/:groupId', validateToken, groupController.getGroupById); */
groupRouter.get('/:groupId/messages', validateToken, groupController.getMessages);
groupRouter.post('/:groupId/message', validateToken, groupController.sendMessage);
groupRouter.post('/findgroup', validateToken, groupController.findGroup);
groupRouter.get('/findgroupbyid/:groupId', validateToken, groupController.findGroupById);

module.exports = groupRouter;