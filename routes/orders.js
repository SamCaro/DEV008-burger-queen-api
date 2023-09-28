const OrdersController = require('../controller/orders');
// const { requireAuth } = require('../middleware/auth');

module.exports = (app, nextMain) => {
  app.get('/orders', /* requireAuth, */ OrdersController.getOrders);
  app.get('/orders/:Id', /* requireAuth, */ OrdersController.getOrderById);
  // app.post('/orders', /* requireAuth, */ OrdersController.createOrder);
  // app.put('/orders/:Id', /* requireAuth, */ OrdersController.updateOrder);
  app.delete('/orders/:Id', /* requireAuth, */ OrdersController.deleteOrder);
  nextMain();
};
