const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
  getProducts: async (req, resp, next) => {
    try {
      const products = await prisma.product.findMany();
      return resp.json(products);
    } catch (error) {
      next(error);
    }
  },
};

// getProductById:
// createProduct:
// updateProduct:
// deleteProduct:
