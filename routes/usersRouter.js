
const express = require('express');
const userController = require('../controllers/userscontroller');
const { validateToken } = require('../middlewares/middlewares');
const multer = require("multer");
const usersRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

usersRouter.post('/register', userController.userRegister);
usersRouter.post('/login', userController.userLogin);
usersRouter.get('/user', validateToken, userController.getUser);
usersRouter.get('/users', userController.getUsers);
usersRouter.put('/update-preferences', validateToken, userController.updateUserPreferences);
usersRouter.put('/forgotpassword', userController.forgotPassword);
usersRouter.post('/upload', validateToken, upload.single('avatar'), userController.setAvatar);
usersRouter.get('/userbyid/:userId',validateToken, userController.getUserById);
usersRouter.post('/subscription', userController.emailSubscribe );
usersRouter.delete('/delete',validateToken, userController.deleteUser );

module.exports = usersRouter;