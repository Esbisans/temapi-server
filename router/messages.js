/*
    Ruta: /api/messages
*/
const { Router } = require('express');
const { validateJWT } = require('../middlewares/validate-jwt');
const { getChat, updateSeenMessage } = require('../controllers/messages');

const router = Router();

router.get('/:from', validateJWT, getChat);

//router.put('/:id', validateJWT, updateSeenMessage);






module.exports = router;