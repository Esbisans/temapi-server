const { connectedUser, disconnectedUser, getUsers, recordMessage, getLastMessages, getUnseenMessages, markMessagesAsSeen, markOneMessageAsSeen, deleteUser } = require("../controllers/sockets");
const { checkJWT } = require("../helpers/jwt");


class Sockets {

    constructor( io ) {

        this.io = io;

        this.socketEvents();
    }

    socketEvents() {
        // On connection
        this.io.on('connection', async( socket ) => {

            // Validate JWT
            const [valid, uid] = checkJWT(socket.handshake.query['x-token']);
            
            // if token is not valid disconnect
            if (!valid) {
                console.log('Socket not identified');
                return socket.disconnect();
            }

            // know which user is connected
            const user = await connectedUser(uid);

            console.log('Client connected: ', user.name);

            //Join to a user room
            socket.join(uid);

            // Emit all users connected
            this.io.emit('user:list', await getUsers());

            // Emit last messages when a user connects
            this.io.to(uid).emit('last:messages', await getLastMessages(uid));

            // Emit unseen messages when a user connects
            this.io.to(uid).emit('unseen:messages', await getUnseenMessages(uid));

            // Listen when the client mark messages as seen
            socket.on('mark:messages:seen', async(payload) => {
                // uid user that seen the messages
                await markMessagesAsSeen(payload, uid);
                this.io.to(uid).emit('unseen:messages', await getUnseenMessages(uid));
            });

            // Listen when the client mark one message as seen
            socket.on('mark:one:message:seen', async(payload) => {
                await markOneMessageAsSeen(payload);
                this.io.to(uid).emit('unseen:messages', await getUnseenMessages(uid));
            });

            // Listen when the client sends a message
            socket.on('personal:message', async(payload) => {
                
                const message = await recordMessage(payload);
                this.io.to(payload.to).emit('personal:message', message);
                this.io.to(payload.from).emit('personal:message', message);

                // Emit last messages when a message is sent
                this.io.to(payload.to).emit('last:messages', await getLastMessages(payload.to));
                this.io.to(payload.from).emit('last:messages', await getLastMessages(payload.from));

                // Emit unseen messages when a message is sent
                this.io.to(payload.to).emit('unseen:messages', await getUnseenMessages(payload.to));
                //this.io.to(payload.from).emit('unseen:messages', await getUnseenMessages(payload.from));
            });

            socket.on('users:changes', async() => {
                console.log('Users changed');
                this.io.emit('user:list', await getUsers());
            });

            // socket.on('delete:user', async(payload) => {
            //     console.log('Delete user', payload);
            //     await deleteUser(payload);
            //     this.io.emit('user:list', await getUsers());
            // });

            // Disconnect
            socket.on('disconnect', async() => {
                console.log('Client disconnected: ', user.name);
                await disconnectedUser(uid);
                this.io.emit('user:list', await getUsers());
            });            
        
        });
    }


}


module.exports = Sockets;