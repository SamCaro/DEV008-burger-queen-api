const UsersController = require('../controller/users');
// const { requireAuth, requireAdmin } = require('../middleware/auth');

module.exports = (app, nextMain) => {
  app.get('/users', /* requireAdmin, */ UsersController.getUsers);
  // app.get('/users/:id', /* requireAuth, */ UsersController.getUserById);
  // app.post('/users', /* requireAdmin, */ UsersController.createUser);
  // app.put('/users/:id', /* requireAuth, */ UsersController.updateUser);
  // app.delete('/users/:id', /* requireAuth, */ UsersController.deleteUSer);
  nextMain();
};
