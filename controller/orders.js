const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
  getOrders: async (req, resp, next) => {
    try {
      const orders = await prisma.order.findMany({
        data: { isActive: true },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              type: true,
              OrderProducts: {
                select: {
                  quantity: true,
                },
              },
            },
          },
        },
      });

      const transformOrder = (order) => {
        const {
          id, userId, client, status, dateEntry, dateProcessed,
        } = order;

        const processedData = status === 'Concluida' ? dateProcessed : [];

        return {
          id,
          userId,
          client,
          status,
          dateEntry,
          dateProcessed: processedData,
        };
      };

      const ordersWithProcessedDate = orders.map((order) => transformOrder(order));

      return resp.status(200).json(ordersWithProcessedDate);
    } catch (error) {
      next(error);
    }
  },

  getOrderById: async (req, resp, next) => {
    try {
      const { _id } = req.params;
      const order = await prisma.order.findUnique({
        where: { id: _id },
        data: { isActive: true },
        incluide: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              type: true,
              OrderProducts: {
                select: {
                  quantity: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        resp.status(404).json({ message: 'Orden no encontrada' });
      }

      const {
        id, userId, client, status, dateEntry, dateProcessed, products,
      } = order;

      const ORDER_STATUS_COMPLETED = 'Concluida';
      const transformProduct = (product) => {
        const {
          id, name, price, image, type, OrderProducts,
        } = product;
        return {
          id,
          name,
          price,
          image,
          type,
          OrderProducts: {
            quantity: OrderProducts.quantity,
          },
        };
      };

      const responseOrder = {
        id,
        userId,
        client,
        status,
        dateEntry,
        ...(status === ORDER_STATUS_COMPLETED && {
          dateProcessed,
        }),

        products: products.map(transformProduct),
      };

      resp.status(200).json(responseOrder);
    } catch (error) {
      next(error);
    }
  },

  // createOrder
  // updateOrder

  deleteOrder: async (req, resp, next) => {
    const { _id } = req.params;
    try {
      const inactiveOrder = await prisma.orders.update({
        where: { id: _id },
        data: { isActive: false },
      });

      if (!inactiveOrder) {
        throw new Error(404);
      } else {
        resp.status(200).json({
          product: {
            id: _id,
            isActive: false,
            name: inactiveOrder.name,
            price: inactiveOrder.price,
            image: inactiveOrder.image,
            type: inactiveOrder.type,
            dateEntry: inactiveOrder.dateEntry.toISOString(),
          },
          message: 'Eliminacion exitosa',
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
