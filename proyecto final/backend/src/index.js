require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files (para PDFs y fotos si los guardamos localmente)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Maestranza R.S SPA API',
      version: '1.0.0',
      description: 'API para la gestión interna de Maestranza R.S SPA'
    },
    servers: [
      { url: `http://localhost:${PORT}` }
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
  apis: ['./src/routes/*.js']
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
const models = [
  'empresa', 'usuario', 'cliente', 'maquina', 'ordentrabajo', 
  'evidenciafotografica', 'itemreparacion', 'material', 
  'materialusado', 'presupuesto', 'pago', 'factura', 'gasto',
  'impuesto'
];

app.use('/api/auth', require('./routes/auth'));

models.forEach(model => {
  app.use(`/api/${model}`, require(`./routes/${model}`));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocurrió un error en el servidor', detail: err.message });
});

// Exportar la app para Vercel Serverless
module.exports = app;

// Solo iniciar el servidor si no estamos en Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Documentación Swagger en http://localhost:${PORT}/api-docs`);
  });
}
