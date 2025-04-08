const { kafka, TOPICS } = require('../../shared/src/config/kafka');
const { client } = require('../../shared/src/config/cassandra');

const consumer = kafka.consumer({ groupId: 'data-processor-group' });

const connectConsumer = async () => {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: TOPICS.DATA_UPDATES, fromBeginning: true });
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
                    
                    // Insert or update data in Cassandra
                    const query = `
                        INSERT INTO realtime_data.key_value_store (key, value, updated_at)
                        VALUES (?, ?, ?)
                    `;
                    
                    await client.execute(query, [
                        data.key,
                        data.value,
                        new Date()
                    ], { prepare: true });

                    console.log(`Processed message: ${data.key} = ${data.value}`);
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            }
        });
    } catch (error) {
        console.error('Error in consumer:', error);
        throw error;
    }
};

module.exports = {
    connectConsumer,
    startConsuming
}; 