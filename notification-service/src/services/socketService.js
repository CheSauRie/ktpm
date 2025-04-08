const socketIO = require('socket.io');
const config = require('../config');

class SocketService {
    constructor() {
        this.io = null;
        this.rooms = new Map(); // Map to store key -> socket rooms
    }

    initialize(server) {
        this.io = socketIO(server, config.socket);

        this.io.on('connection', (socket) => {
            console.log('New client connected');

            // Handle subscription to key updates
            socket.on('subscribe', (key) => {
                if (!this.rooms.has(key)) {
                    this.rooms.set(key, new Set());
                }
                this.rooms.get(key).add(socket.id);
                socket.join(key);
                console.log(`Client ${socket.id} subscribed to ${key}`);
            });

            // Handle unsubscription from key updates
            socket.on('unsubscribe', (key) => {
                if (this.rooms.has(key)) {
                    this.rooms.get(key).delete(socket.id);
                    socket.leave(key);
                    console.log(`Client ${socket.id} unsubscribed from ${key}`);
                }
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log('Client disconnected');
                // Clean up rooms
                this.rooms.forEach((sockets, key) => {
                    sockets.delete(socket.id);
                    if (sockets.size === 0) {
                        this.rooms.delete(key);
                    }
                });
            });
        });
    }

    broadcastUpdate(key, data) {
        if (this.io) {
            this.io.to(key).emit('update', {
                key,
                value: data.value,
                timestamp: data.timestamp
            });
            console.log(`Broadcasted update for key ${key}`);
        }
    }
}

const socketService = new SocketService();

 