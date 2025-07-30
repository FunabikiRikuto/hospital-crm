import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import casesRouter from './routes/cases';
import agentsRouter from './routes/agents';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'hospital-crm-backend'
  });
});

// Basic API route
app.get('/api', (req, res) => {
  res.json({
    message: 'Hospital CRM Backend API',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/cases', casesRouter);
app.use('/api/agents', agentsRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Hospital CRM Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

export default app;