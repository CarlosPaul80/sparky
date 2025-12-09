const { Router } = require('express');
const UserCtrl = require('../controllers/authController');

const apiRouter = Router();

apiRouter.post('/register', UserCtrl.register);
apiRouter.post('/login', UserCtrl.login);

module.exports = apiRouter;