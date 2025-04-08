require('dotenv').config();

module.exports = {
    port: process.env.NOTIFICATION_SERVICE_PORT || 3001,
    kafka: {
        brokers: process.env.KAFKA_BROKERS.split(','),
        groupId: 'notification-service-group'
    },
    socket: {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        },
        pingTimeout: 60000,
        pingInterval: 25000
    }
}; 