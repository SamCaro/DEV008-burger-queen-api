const ProductsController = require('../controller/products');
// const { requireAuth, requireAdmin } = require('../middleware/auth');

module.exports = (app, nextMain) => {
  app.get('/products', /* requireAuth, */ ProductsController.getProducts);
  app.get('/products/:Id', /* requireAuth, */ ProductsController.getProductById);
  app.post('/products', /*  requireAdmin, */ ProductsController.createProduct);
  app.put('/products/:Id', /* requireAdmin, */ ProductsController.updateProduct);
  app.delete('/products/:Id', /* requireAdmin, */ ProductsController.deleteProduct);
  nextMain();
};
