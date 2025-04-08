require('dotenv').config();

module.exports = {
    port: process.env.API_GATEWAY_PORT || 3000,
    kafka: {
        brokers: process.env.KAFKA_BROKERS.split(',')
    },
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    }
}; 