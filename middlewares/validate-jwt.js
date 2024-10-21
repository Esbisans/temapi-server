const jwt = require('jsonwebtoken');

const validateJWT = (req, res = response, next) => {
    try {
        const token = req.header('x-token');

        if (!token) {
            return res.status(401).json({
                ok: false,
                msg: 'Token not found'
            });
        }

        const {uid} = jwt.verify(token, process.env.JWT_SECRET);
        req.uid = uid;
        
        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Invalid token'
        });
    }
}

module.exports = {
    validateJWT
}