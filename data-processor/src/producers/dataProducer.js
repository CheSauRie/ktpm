const { kafka, TOPICS } = require('../../shared/src/config/kafka');

const producer = kafka.producer();

const connectProducer = async () => {
    try {
        await producer.connect();
        console.log('Kafka producer connected successfully');
    } catch (error) {
        console.error('Error connecting Kafka producer:', error);
        throw error;
    }
};

const sendMessage = async (topic, message) => {
    try {
        await producer.send({
            topic,
            messages: [
                {
                    value: JSON.stringify(message)
                }
            ]
        });
        console.log(`Message sent to topic ${topic}:`, message);
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

module.exports = {
    connectProducer,
    sendMessage,
    TOPICS
}; 