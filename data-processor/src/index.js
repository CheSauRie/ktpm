require('dotenv').config();
const { initCassandra } = require('../../shared/src/config/cassandra');
const { connectConsumer, startConsuming, disconnectConsumer } = require('./services/kafkaService');
const { startBatchProcessing } = require('./services/cassandraService');

// Handle graceful shutdown
const shutdown = async () => {
    console.log('Shutting down...');
    await disconnectConsumer();
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const startService = async () => {
    try {
        // Initialize Cassandra
        await initCassandra();
        
        // Start batch processing
        startBatchProcessing();
        
        // Connect to Kafka and start consuming
        await connectConsumer();
        await startConsuming();
        
        console.log('Data Processor service started successfully');
    } catch (error) {
        console.error('Error starting Data Processor service:', error);
        process.exit(1);
    }
};

startService(); 