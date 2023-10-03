/* eslint-disable radix */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
  getProducts: async (req, resp, next) => {
    try {
      const products = await prisma.products.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          type: true,
          createdAt: true,
        },
      });
      resp.status(200).json(products);
    } catch (error) {
      next(error);
    }
  },

  getProductById: async (req, resp, next) => {
    const { id: productId } = req.params;
    try {
      const product = await prisma.products.findUnique({
        where: { id: parseInt(productId) },
      });

      if (!product) {
        resp.status(404).json({ message: 'Product Not Found' });
      }

      resp.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },

  createProduct: async (req, resp, next) => {
    const {
      name, price, image, type,
    } = req.body;
    try {
      const newProduct = await prisma.products.create({
        data: {
          name,
          price,
          image,
          type,
        },
      });

      resp.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  },

  updateProduct: async (req, resp, next) => {
    const { id: productId } = req.params;
    try {
      const {
        name, price, image, type,
      } = req.body;

      const updatedProduct = await prisma.products.update({
        where: {
          id: parseInt(productId),
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
    const { id: productId } = req.params;
    try {
      const inactiveProduct = await prisma.products.update({
        where: { id: parseInt(productId) },
        data: {
          isActive: false,
        },
      });

      if (!inactiveProduct) {
        throw new Error(404);
      } else {
        resp.status(200).json({
          product: {
            id: inactiveProduct.id,
            isActive: false,
            name: inactiveProduct.name,
            price: inactiveProduct.price,
            image: inactiveProduct.image,
            type: inactiveProduct.type,
            updateAt: inactiveProduct.updateAt.toISOString(),
          },
          message: 'Eliminación exitosa',
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
