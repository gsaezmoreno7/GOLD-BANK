require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');

// Import Routes
const authRoutes = require('./routes/auth.routes');
const accountRoutes = require('./routes/account.routes');
const transactionRoutes = require('./routes/transaction.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false, // For Swagger UI
    crossOriginEmbedderPolicy: false,
}));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Raíz de la API
app.get('/', (req, res) => {
    res.json({
        name: 'Gold Bank API',
        version: '1.0.0',
        status: 'online',
        documentation: '/api-docs',
        message: 'El servidor backend está funcionando correctamente.'
    });
});

// Health Check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        error: err.message || 'Error interno del servidor',
        status: 'error'
    });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`\n🏦 GOLD BANK API IS LIVE`);
        console.log(`🚀 Server: http://localhost:${PORT}`);
        console.log(`📚 Docs:   http://localhost:${PORT}/api-docs\n`);
    });
}

module.exports = app;
