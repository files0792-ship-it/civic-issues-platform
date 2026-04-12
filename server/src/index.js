import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import issuesRoutes from './routes/issues.js';
import adminRoutes from './routes/admin.js';
import mlRoutes from './routes/ml.js';
import citiesRoutes from './routes/cities.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Trust proxy when deployed behind reverse proxy (Heroku, Railway, etc.)
app.set('trust proxy', 1);

app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json());

app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'))
);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'civic-issues-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ml', mlRoutes);

// Multer / validation errors
app.use((err, _req, res, next) => {
  if (err?.message?.includes('Only image')) {
    return res.status(400).json({ message: err.message });
  }
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large (max 5MB)' });
  }
  next(err);
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down server...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGTERM', () => {
      console.log('\nShutting down server...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  })
  .catch((e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please check if another server is running.`);
      console.error('Try running: netstat -ano | findstr :5000 to find the process');
      console.error('Then kill it: taskkill /PID [PID] /F');
    } else {
      console.error('Failed to start:', e);
    }
    process.exit(1);
  });
