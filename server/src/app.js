import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middlewares - configured to allow AI Studio iframe preview
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  frameguard: false
}));

app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');
  next();
});

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API endpoints
app.use('/api', apiRoutes);

// Static client build assets
const rootDistPath = path.resolve(__dirname, '../../dist');
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const githubAssetsPath = path.resolve(__dirname, '../../.github/assets');
const appLegacyPath = path.resolve(__dirname, '../../app');

app.use('/.github/assets', express.static(githubAssetsPath));
app.use(express.static(rootDistPath));
app.use(express.static(clientDistPath));
app.use(express.static(appLegacyPath));

// SPA Fallback for client routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const rootIndex = path.join(rootDistPath, 'index.html');
  const clientIndex = path.join(clientDistPath, 'index.html');
  const legacyIndex = path.join(appLegacyPath, 'index.html');

  res.sendFile(rootIndex, (err) => {
    if (err) {
      res.sendFile(clientIndex, (err2) => {
        if (err2) {
          res.sendFile(legacyIndex, (err3) => {
            if (err3) {
              res.status(200).send('Sahafi Rent Book is initializing...');
            }
          });
        }
      });
    }
  });
});

// Centralized error handling
app.use(errorHandler);

export default app;
