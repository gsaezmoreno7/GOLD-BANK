const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'Token no proveído' });
  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.rol !== 'ADMIN') return res.status(403).json({ error: 'Requiere rol ADMIN' });
  next();
};

exports.isAdministrativo = (req, res, next) => {
  if (req.user.rol !== 'ADMIN' && req.user.rol !== 'ADMINISTRATIVO') return res.status(403).json({ error: 'Requiere rol ADMINISTRATIVO' });
  next();
};
