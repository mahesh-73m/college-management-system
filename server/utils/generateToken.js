const jwt = require('jsonwebtoken');

// Signs a JWT carrying the user's id and role. Role is embedded so
// middleware can authorize without an extra DB lookup on every request.
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = generateToken;
