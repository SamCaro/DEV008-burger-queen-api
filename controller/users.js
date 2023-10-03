/* eslint-disable radix */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const bcrypt = require('bcrypt');

module.exports = {
  initAdminUser: async (app, next) => {
    try {
      const { adminEmail, adminPassword } = app.get('../config');
      // si no se proporcionan las credenciales de admin no se inicializa.
      if (!adminEmail || !adminPassword) {
        return next();
      }

      const adminUser = {
        email: adminEmail,
        // Contraseña hash con un costo de 10 rondas de procesamiento 2^10 (1024)
        adminPassword: bcrypt.hashSync(adminPassword, 10),
        Role: 'Admin',
      };

      // Asegurar que solo haya un usuario admin con el mismo correo electrónico en la base de datos
      await prisma.users.upsert({
        where: { email: adminUser.email },
        update: adminUser,
        create: adminUser,
      });
    } catch (error) {
      next(error);
    }

    next();
  },

  getUsers: async (req, resp, next) => {
    try {
      const users = await prisma.users.findMany({
        select: {
          id: true,
          email: true,
          Role: true,
        },
      });
      resp.status(200).json(users);
    } catch (error) {
      console.error('Error: User search was unsuccessful:', error);
      next({ status: 500, message: 'Internal server error', error });
    }
  },

  getUserById: async (req, resp, next) => {
    try {
      const { id: UserId } = req.params;
      const user = await prisma.users.findUnique({
        where: { id: parseInt(UserId) },
      });

      if (!user) {
        resp.status(404).json({ message: 'User Not found' });
      }

      resp.status(200).json(user);
    } catch (error) {
      next({ status: 500, message: 'Internal server error', error });
    }
  },

  createUser: async (req, resp, next) => {
    try {
      const { email, password, Role } = req.body;
      if (!email || !password || !Role) {
        next({ status: 400, message: 'Required fields.' });
      }

      const newUser = await prisma.users.create({
        data: {
          email,
          password: bcrypt.hashSync(password, 10),
          Role,
        },
        select: {
          id: true,
          email: true,
          Role: true,
        },
      });

      resp.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (req, resp, next) => {
    try {
      const { id: uid } = req.params;
      const { email, password, Role } = req.body;
      const user = prisma.users.findUnique({
        where: { id: parseInt(uid) },
      });

      if (!user) {
        resp.status(404).json({ message: 'User Not found' });
      }

      const updateUser = await prisma.users.update({
        where: { id: parseInt(uid) },
        data: {
          email: email || user.email,
          password: password ? bcrypt.hashSync(password, 10) : user.password,
          Role: Role || user.Role,
        },
      });

      resp.status(200).json(updateUser);
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req, resp, next) => {
    const { id: uid } = req.params;
    try {
      const inactiveUser = await prisma.users.update({
        where: { id: parseInt(uid) },
        data: {
          isActive: false,
        },
      });

      if (!inactiveUser) {
        resp.status(404).json({ message: 'User Not Found' });
      } else {
        resp.status(200).json({
          Users: {
            id: inactiveUser.id,
            isActive: false,
            email: inactiveUser.email,
            password: inactiveUser.password,
            Role: inactiveUser.Role,
          },
          message: 'Eliminacion exitosa',
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
