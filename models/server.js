// Servidor de Express
const express  = require('express');
const http     = require('http');
const socketio = require('socket.io');
const cors     = require('cors');

const Sockets  = require('./sockets');
const { dbConnection } = require('../database/config');

class Server {

    constructor() {

        this.app  = express();
        this.port = process.env.PORT;

        //connect to DB
        dbConnection();

        // Http server
        this.server = http.createServer( this.app );
        
        // Sockets configuration
        this.io = socketio( this.server, { /* config */ } );
    }

    middlewares() {
        // CORS
        this.app.use(cors());

        // Parse body
        this.app.use( express.json() );

        this.app.use( '/api/login', require('../router/auth') );
        this.app.use( '/api/messages', require('../router/messages') );
    }

    configureSockets() {
        new Sockets( this.io );
    }

    execute() {

        // Inicializar Middlewares
        this.middlewares();

        // Inicializar sockets
        this.configureSockets();

        // Inicializar Server
        this.server.listen( this.port, () => {
            console.log('Server run at port:', this.port );
        });
    }

}


module.exports = Server;