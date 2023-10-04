/* eslint-disable max-len */
/* eslint-disable radix */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
  getOrders: async (req, resp, next) => {
    try {
      const orders = await prisma.orders.findMany({
        where: {
          isActive: true,
        },
        include: {
          Products: {
            select: {
              quantity: true,
              id: true,
              Products: {
                select: {
                  name: true,
                  price: true,
                  image: true,
                  type: true,
                  updateAt: true,
                },
              },
            },
          },
        },
      });

      const ordersWtihStatus = orders.map((order) => ({
        id: order.id,
        UserId: order.id,
        client: order.client,
        status: order.status,
        updateAt: order.updateAt,
        ...(order.status === 'delivered' && {
          dateProcessed: order.dateProcessed,
        }),
        Products: order.Products.map((product) => ({
          id: product.id,
          quantity: product.quantity,
          product: product.Products,
        })),
      }));

      resp.status(200).json(ordersWtihStatus);
    } catch (error) {
      next(error);
    }
  },

  getOrderById: async (req, resp, next) => {
    try {
      const { id: orderId } = req.params;

      const orders = await prisma.orders.findUnique({
        where: {
          id: parseInt(orderId),
        },
        include: {
          Products: {
            select: {
              quantity: true,
              id: true,
              Products: {
                select: {
                  name: true,
                  price: true,
                  image: true,
                  type: true,
                  updateAt: true,
                },
              },
            },
          },
        },
      });

      resp.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  },

  createOrder: async (req, resp, next) => {
    try {
      const { UserId, client, Products } = req.body;

      // console.info('UserId:', UserId);
      // console.info('client:', client);
      // console.info('products:', Products);

      if (!UserId || !client || !Products /* || !Products.length */) {
        resp.status(400).json({ message: 'Datos incompletos en la solicitud' });
      }

      const existingUser = await prisma.users.findUnique({
        where: {
          id: UserId,
        },
      });

      console.info('existing:', existingUser);

      if (!existingUser) {
        resp.status(404).json({ message: `User con ID ${UserId} no encontrado` });
      }

      // Crear order
      const order = await prisma.orders.create({
        data: {
          UserId,
          client,
          status: 'pending',
          updateAt: new Date(),
        },
      });

      console.info('order:', order);

      // Agregar productos a la order
      await Promise.all(
        Products.map(async (productData) => {
          const { quantity, product } = productData;
          const existingProduct = await prisma.products.findUnique({
            where: { id: product.id },
          });

          if (!existingProduct) {
            resp.status(404).json({ message: `Producto con ID ${product.id} no encontrado` });
          }

          await prisma.ordersProducts.create({
            data: {
              OrderId: order.id,
              ProductId: existingProduct.id,
              quantity,
            },
          });
        }),
      );

      // Obtener la order con detalles de productos
      const orderWithProducts = await prisma.orders.findUnique({
        where: { id: order.id },
        include: {
          Products: {
            select: {
              id: true,
              name: true,
              image: true,
              price: true,
            },
            througth: { // Relaciona la tabla asociada OrdersProducts y permite usar esos datos en comun
              select: {
                quantity: true,
              },
            },
          },
        },
        select: {
          id: true,
          UserId: true,
          client: true,
          status: true,
          updateAt: true,
          dateProcessed: true,
        },
      });

      // Preparar la respuesta
      const responseOrder = {
        id: orderWithProducts.id,
        UserId: orderWithProducts.id,
        client: orderWithProducts.id,
        status: orderWithProducts.status,
        updateAt: orderWithProducts.updateAt,
        Products: orderWithProducts.Products,
      };

      if (orderWithProducts.dateProcessed !== null) {
        responseOrder.dateProcessed = orderWithProducts.dateProcessed;
      }

      // Enviar respuesta exitosa
      resp.status(200).json(responseOrder);
    } catch (error) {
      next(error);
    } finally {
      await prisma.$disconnect();
    }
  },

  updateOrder: async (req, resp, next) => {
    try {
      const { id: orderId } = req.params;
      const { status } = req.body;

      const statusValues = ['pending', 'canceled', 'delivering', 'delivered'];
      if (!statusValues.includes(status)) {
        resp.status(400).json({
          message: `Ingresar status: ${statusValues.join(', ')}`,
        });
      }

      const order = await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: {
          status,
          dateProcessed: status === 'delivered' ? new Date() : null,
        },
      });

      const responseOrder = {
        id: order.id,
        UserId: order.UserId,
        client: order.client,
        status: order.status,
        updateAt: order.updateAt,
        dateProcessed: order.dateProcessed,
      };

      resp.status(200).json(responseOrder);
    } catch (error) {
      next(error);
    }
  },

  deleteOrder: async (req, resp, next) => {
    const { id: orderId } = req.params;
    try {
      const inactiveOrder = await prisma.orders.update({
        where: { id: parseInt(orderId) },
        data: { isActive: false },
      });

      if (!inactiveOrder) {
        resp.status(404).json({ message: 'Order Not Found' });
      } else {
        resp.status(200).json({
          Product: {
            id: inactiveOrder.id,
            isActive: false,
            name: inactiveOrder.name,
            price: inactiveOrder.price,
            image: inactiveOrder.image,
            type: inactiveOrder.type,
            updateAt: inactiveOrder.updateAt,
          },
          message: 'Eliminación exitosa',
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
