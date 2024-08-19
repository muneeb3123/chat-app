const socketIo = require('socket.io')
const http = require('http');

// Create an HTTP server
const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
});

const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const users = {};

io.on('connection', socket => {
    socket.on('new-user-joined', name => {
        // socket.to(socket.id).emit('previous-users', users);
        users[socket.id] = name;
        io.emit('user-joined', name, users, socket.id);
    });

    socket.on('send', (message , room) => {
        socket.to(room).emit('receive', { message: message, name: users[socket.id]});
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });

});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});