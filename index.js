const express = require('express');
const cors = require('cors');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const routes = require('./routes');
const pkg = require('./package.json');

const port = process.env.PORT || 3000;

const { secret } = config;
const app = express();

app.set('config', config);
app.set('pkg', pkg);

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false })); // use ---> son los middleware 'capas'
app.use(express.json());
app.use(authMiddleware(secret));

const corsOptions = {
  Credential: true,
};
// comunica el servidor con otros servidores
app.use(cors(corsOptions));

// Registrar rutas
routes(app, (err) => {
  if (err) {
    throw err;
  }

  app.use(errorHandler);

  // endpoint ---> es la ruta que acepta solicitudes y devuelve respuestas,
  // forma en q se comunican las apps
  app.listen(port, () => {
    console.info(`App listening on port ${port}`);
  });
});
