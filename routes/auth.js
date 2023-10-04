const AuthController = require('../controller/auth');

module.exports = (app, nextMain) => {
  app.post('/auth', AuthController.postAuth);
  nextMain();
};
