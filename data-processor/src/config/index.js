require('dotenv').config();

module.exports = {
    kafka: {
        brokers: process.env.KAFKA_BROKERS.split(','),
        groupId: 'data-processor-group'
    },
    cassandra: {
        hosts: process.env.CASSANDRA_HOSTS.split(','),
        keyspace: 'realtime_data'
    },
    batch: {
        size: 100,
        interval: 1000 // 1 second
    }
}; 