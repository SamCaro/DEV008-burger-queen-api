const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
  getProducts: async (req, resp, next) => {
    try {
      const products = await prisma.products.findMany({
        where: {
          isActive: true,
        },
      });
      resp.status(200).json(products);
    } catch (error) {
      next(error);
    }
  },

  getProductById: async (req, resp, next) => {
    const { _id } = req.params;
    try {
      const getById = await prisma.product.findUnique({
        where: {
          id: _id,
          isActive: true,
        },
      });
      resp.status(200).json(getById);
    } catch (error) {
      next(error);
    }
  },

  createProduct: async (req, resp, next) => {
    const newProduct = req.body;
    try {
      const createdProduct = await prisma.products.create({
        data: newProduct,
      });
      resp.status(200).json(createdProduct);
    } catch (error) {
      next(error);
    }
  },

  updateProduct: async (req, resp, next) => {
    const { _id } = req.params;
    try {
      const {
        name, price, image, type,
      } = req.body;

      const updatedProduct = await prisma.product.update({
        where: {
          id: _id,
        },
        data: {
          name,
          price,
          image,
          type,
        },
      });

      resp.status(200).json(updatedProduct);
    } catch (error) {
      next(error);
    }
  },

  deleteProduct: async (req, resp, next) => {
    const { _id } = req.params;
    try {
      const inactiveProduct = await prisma.products.update({
        where: {
          id: _id,
        },
        data: {
          isActive: false,
        },
      });

      if (!inactiveProduct) {
        throw new Error(404);
      } else {
        resp.status(200).json({
          product: {
            id: _id.toString(),
            isActive: false,
            name: inactiveProduct.name,
            price: inactiveProduct.price,
            image: inactiveProduct.image,
            type: inactiveProduct.type,
            dateEntry: inactiveProduct.dateEntry.toISOString(),
          },
          message: 'Eliminación exitosa',
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
