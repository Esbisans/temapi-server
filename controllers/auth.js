const { response } = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Message = require('../models/message');
const { generateJWT } = require('../helpers/jwt');

const createUser = async (req, res  = response) => {
    try {
        const { email, password} = req.body;  

        // Verify email
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({
                ok: false,
                msg: 'The email is already registered'
            });
        }

        // Create user with the model
        const user = new User(req.body);

        // Encrypt password
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(password, salt);

        // Save user
        await user.save();
        // Generate JWT
        const token = await generateJWT( user.id );

        res.json({
            ok: true,
            user,
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Please talk to the administrator'
        });
    }

}

const login = async (req, res  = response) => {

    const {email, password} = req.body;  

    try {
        // Verify email
        const userDB = await User
            .findOne({ email });

        if (!userDB) {
            return res.status(404).json({
                ok: false,
                msg: 'Email not found'
            });
        }

        // Verify password with bcrypt
        const validPassword = bcrypt.compareSync(password, userDB.password);

        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Password not valid'
            });
        }

        const token = await generateJWT( userDB.id );

        res.json({
            ok: true,
            user: userDB,
            token
        });

    }

    catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Please talk to the administrator'
        });
    }

} 

const renewToken = async (req, res  = response) => {

    const uid = req.uid;

    // Generate a new JWT
    const token = await generateJWT( uid );

    // Get the user by UID
    const user = await User.findById( uid );

    res.json({
        ok: true,
        user,
        token
    });
}

const deleteUser = async (req, res = response) => {
    const uid = req.uid;

    try {
        // Check if the user exists
        const user = await User.findById(uid);
        if (!user) {
            return res.status(404).json({
                ok: false,
                msg: 'User not found',
            });
        }

        // Delete the user
        await User.findByIdAndDelete(uid);
        console.log('User deleted successfully');

        // Delete the messages associated with the user
        await Message.deleteMany({ $or: [{ from: uid }, { to: uid }] });
        console.log('Messages deleted successfully');

        res.json({
            ok: true,
            msg: 'User and associated messages deleted successfully',
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Please talk to the administrator',
        });
    }
};


module.exports = {
    createUser,
    login,
    renewToken,
    deleteUser
}