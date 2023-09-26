const { dbUrl } = require('./config');

async function connect() {
  try {
    await dbUrl.$connect();
    console.info('Conexión con la base de datos exitosa.');
  } catch (error) {
    console.error('Error no se establecido conexión con la base de datos', error);
    throw error;
  }
}

module.exports = { connect };
