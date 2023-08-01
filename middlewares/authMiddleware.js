const queryResult = require('../utils/queryResult')
const jwt = require('jsonwebtoken')
const secret = process.env.SUPABASE_JWT_SECRET

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json(queryResult(false, 'No Token Provided'))

    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.status(401).json(queryResult(false, 'Auth Token Invalid or Expired'))
        req.userId = decoded.sub;
        next();
    })
}

module.exports = authMiddleware