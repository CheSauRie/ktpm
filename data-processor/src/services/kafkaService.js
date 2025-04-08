const { kafka, TOPICS } = require('../../shared/src/config/kafka');
const config = require('../config');
const { saveData } = require('./cassandraService');

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
            topic: TOPICS.DATA_UPDATES,
            fromBeginning: false
        });
        console.log('Kafka consumer connected successfully');
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
                    await saveData(data.key, data.value);
                    
                    // Send notification to notification service
                    await consumer.send({
                        topic: TOPICS.NOTIFICATIONS,
                        messages: [{
                            value: JSON.stringify({
                                key: data.key,
                                value: data.value,
                                timestamp: new Date()
                            })
                        }]
                    });
                } catch (error) {
                    console.error('Error processing message:', error);
                    // Implement dead letter queue or retry mechanism here
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