import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { openapi } from './docs/openapi.js';
import { errorHandler, notFound } from './middlewares/errors.js';
import { logger } from './middlewares/logger.js';
import apiRoutes from './routes/index.js';

const app = express();

const SWAGGER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.34.1';
const swaggerAssets = process.env.VERCEL
  ? {
      customCssUrl: `${SWAGGER_CDN}/swagger-ui.min.css`,
      customJs: [`${SWAGGER_CDN}/swagger-ui-bundle.min.js`, `${SWAGGER_CDN}/swagger-ui-standalone-preset.min.js`],
    }
  : {};

app.use(logger);

app.use(cors({ origin: env.corsOrigins, exposedHeaders: ['X-Total-Count'] }));

app.use(express.json({ limit: '8mb' }));

app.get('/', (req, res) => res.redirect('/api/docs'));
app.get('/api/docs.json', (req, res) => res.json(openapi));
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(openapi, {
    customSiteTitle: 'Second Hand API · Swagger',
    swaggerOptions: { persistAuthorization: true },
    ...swaggerAssets,
  })
);

app.use('/api', async (req, res, next) => {
  await connectDB();
  next();
});

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
