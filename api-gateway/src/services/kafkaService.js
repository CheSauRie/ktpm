const { kafka, TOPICS } = require('../../shared/src/config/kafka');

const producer = kafka.producer();

const connectProducer = async () => {
    try {
        await producer.connect();
        console.log('API Gateway Kafka producer connected successfully');
    } catch (error) {
        console.error('Error connecting Kafka producer:', error);
        throw error;
    }
};

const sendDataUpdate = async (key, value) => {
    try {
        await producer.send({
            topic: TOPICS.DATA_UPDATES,
            messages: [
                {
                    value: JSON.stringify({ key, value })
                }
            ]
        });
        console.log(`Data update sent: ${key} = ${value}`);
    } catch (error) {
        console.error('Error sending data update:', error);
        throw error;
    }
};

module.exports = {
    connectProducer,
    sendDataUpdate
}; 