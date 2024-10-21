// Server Model: Content the server configuration
const Server = require('./models/server');

// Config .env
require('dotenv').config();


// init server
const server = new Server();

// Execute server
server.execute();


