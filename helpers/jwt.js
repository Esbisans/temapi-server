const jwt = require('jsonwebtoken');

const generateJWT = (uid) => {
    return new Promise((resolve, reject) => {
        const payload = { uid };

        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '24h'
        }, (err, token) => {
            if (err) {
                console.log(err);
                reject('Failed to generate token');
            } else {
                resolve(token);
            }
        });
    });
}

const checkJWT = (token = '') => {
    try {
        const { uid } = jwt.verify(token, process.env.JWT_SECRET);
        return [true, uid];
    } catch (error) {
        return [false, null];
    }
}

module.exports = {
    generateJWT,
    checkJWT
}