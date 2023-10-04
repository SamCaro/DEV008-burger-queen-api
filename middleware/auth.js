const jwt = require('jsonwebtoken');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    console.info('Authorization header missing');
    return next();
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    console.warn('Invalid authorization type');
    return next();
  }

  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      console.error('Token verification failed:', err);
      return resp.status(403).send('Access prohibited');
    }

    // TODO: Verificar identidad del usuario usando `decodeToken.uid`
    console.info('Token verified:', decodedToken);
    req.user = decodedToken;
    next();
  });
};

module.exports.isAuthenticated = (req) => {
  // TODO: decidir por la información del request si la usuaria está autenticada
  const { user } = req;
  return user !== undefined; // ---> si user no es indefinido devuelve true
};

module.exports.isAdmin = (req) => {
  // TODO: decidir por la información del request si la usuaria es admin
  const { user } = req;
  return user && user.Role && user.Role === 'Admin';
};

module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);

module.exports.requireAdmin = (req, resp, next) => (
  // eslint-disable-next-line no-nested-ternary
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next()
);
