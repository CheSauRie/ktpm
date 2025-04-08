const { kafka, TOPICS } = require('../../shared/src/config/kafka');
const config = require('../config');
const socketService = require('./socketService');

const consumer = kafka.consumer({
    groupId: config.kafka.groupId,
    retry: {
        initialRetryTime: 100,
        retries: 10
    }
});

const connectConsumer = async () => {
    try {
        await consumer.connect();
        await consumer.subscribe({ 
            topic: TOPICS.NOTIFICATIONS,
            fromBeginning: false
        });
        console.log('Notification Service Kafka consumer connected successfully');
    } catch (error) {
        console.error('Error connecting Kafka consumer:', error);
        throw error;
    }
};

const startConsuming = async () => {
    try {
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const data = JSON.parse(message.value.toString());
                    // Broadcast update to subscribed clients
                    socketService.broadcastUpdate(data.key, data);
                } catch (error) {
                    console.error('Error processing notification:', error);
                }
            }
        });
    } catch (error) {
        console.error('Error in consumer:', error);
        throw error;
    }
};

const disconnectConsumer = async () => {
    try {
        await consumer.disconnect();
        console.log('Kafka consumer disconnected');
    } catch (error) {
        console.error('Error disconnecting Kafka consumer:', error);
    }
};

module.exports = {
    connectConsumer,
    startConsuming,
    disconnectConsumer
}; 