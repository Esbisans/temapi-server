/*
    Path api/login
*/


const { Router } = require('express');
const { createUser, login, renewToken, deleteUser } = require('../controllers/auth');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');

const router = Router();

//Crear nuevos usuarios
router.post('/new', [
    check('avatar', 'avatar is required').not().isEmpty(),
    check('name', 'name is required').not().isEmpty(),
    check('email', 'email is required').isEmail(),
    check('password', 'password is required').not().isEmpty(),
    validateFields
], createUser);

//Login
router.post('/', 
    [
        check('email', 'email is required').isEmail(),
        check('password', 'password is required').not().isEmpty(),
        validateFields
    ] 
    ,login);

//Revalidar token
router.get('/renew', validateJWT ,renewToken);

router.delete('/delete/:id', validateJWT, deleteUser);


module.exports = router;