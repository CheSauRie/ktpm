require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const dataRoutes = require('./routes/dataRoutes');
const { connectProducer } = require('./services/kafkaService');

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', dataRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const startServer = async () => {
    try {
        // Connect to Kafka
        await connectProducer();
        
        // Start server
        app.listen(config.port, () => {
            console.log(`API Gateway is running on port ${config.port}`);
        });
    } catch (error) {
        console.error('Error starting API Gateway:', error);
        process.exit(1);
    }
};

startServer(); 