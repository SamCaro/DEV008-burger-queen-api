/* eslint-disable max-len */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secret } = require('../config');
const { setGlobalToken } = require('../middleware/tokenStorage');

module.exports = {
  postAuth: async (req, resp) => {
    console.info('Solicitud de inicio de sesion recibida');
    const { email, password } = req.body;

    if (!email || !password) {
      resp.status(400).json({ error: 'Tu Email y Password son requeridos' });
    }

    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      resp.status(404).json({ message: 'User Not found' });
    }

    // -----
    // const passwordnew = '$2b$12$kWnYNePujvMYgGG7FjANg.0jqf1BqTNa7ii/FauLcPNWMgQjp.BIC';
    // const isPasswordMatch = bcrypt.compareSync('admin', passwordnew);

    // if (isPasswordMatch) {
    //   resp.json('ok');
    // } else {
    //   resp.json('no son iguales');
    // }

    // --------

    // Comprobar si la contraseña proporcionada coincide con la contraseña almacenada en la base de datos
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      resp.status(404).json({ message: 'Not found' });
    }

    // Generar un token JWT con la información del usuario
    const token = jwt.sing({ email: user.email, role: user.Role }, secret, {
      expiresIn: '1h',
    });

    console.info('Token generado:', token);
    // Almacenar el token en un lugar adecuado
    setGlobalToken(token);

    resp.status(200).json({ token });
  },
};
