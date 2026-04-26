const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '🏦 GOLD BANK API',
            version: '1.0.0',
            description: 'API profesional para gestión de banca premium con seguridad JWT y Supabase.',
            contact: {
                name: 'Gold Bank Support',
                email: 'support@goldbank.cl'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor Local de Desarrollo'
            },
            {
                url: 'https://gold-bank-api.vercel.app',
                description: 'Servidor de Producción'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
