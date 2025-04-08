require('dotenv').config();
const express = require('express');
const http = require('http');
const config = require('./config');
const socketService = require('./services/socketService');
const { connectConsumer, startConsuming, disconnectConsumer } = require('./services/kafkaService');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
socketService.initialize(server);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Handle graceful shutdown
const shutdown = async () => {
    console.log('Shutting down...');
    await disconnectConsumer();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const startService = async () => {
    try {
        // Connect to Kafka and start consuming
        await connectConsumer();
        await startConsuming();
        
        // Start server
        server.listen(config.port, () => {
            console.log(`Notification Service is running on port ${config.port}`);
        });
    } catch (error) {
        console.error('Error starting Notification Service:', error);
        process.exit(1);
    }
};

startService(); 