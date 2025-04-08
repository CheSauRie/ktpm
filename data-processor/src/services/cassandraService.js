const { client } = require('../../shared/src/config/cassandra');
const config = require('../config');

class BatchProcessor {
    constructor() {
        this.batch = [];
        this.processing = false;
    }

    async addToBatch(key, value) {
        this.batch.push({ key, value, timestamp: new Date() });
        
        if (this.batch.length >= config.batch.size) {
            await this.processBatch();
        }
    }

    async processBatch() {
        if (this.processing || this.batch.length === 0) return;
        
        this.processing = true;
        const currentBatch = [...this.batch];
        this.batch = [];

        try {
            const queries = currentBatch.map(item => ({
                query: 'INSERT INTO realtime_data.key_value_store (key, value, updated_at) VALUES (?, ?, ?)',
                params: [item.key, item.value, item.timestamp]
            }));

            await client.batch(queries, { prepare: true });
            console.log(`Processed batch of ${currentBatch.length} items`);
        } catch (error) {
            console.error('Error processing batch:', error);
            // Retry failed items
            this.batch = [...this.batch, ...currentBatch];
        } finally {
            this.processing = false;
        }
    }

    startBatchInterval() {
        setInterval(() => this.processBatch(), config.batch.interval);
    }
}

const batchProcessor = new BatchProcessor();

const saveData = async (key, value) => {
    await batchProcessor.addToBatch(key, value);
};

module.exports = {
    saveData,
    startBatchProcessing: () => batchProcessor.startBatchInterval()
}; 