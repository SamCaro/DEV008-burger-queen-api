import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

module.exports = {
  getProducts: async (req, res, next) => {
    try {
      const products = await prisma.product.findMany();
      res.json(products);
    } catch (error) {
      next(error);
    }
  },
};

// getProductById:
// createProduct:
// updateProduct:
// deleteProduct:
