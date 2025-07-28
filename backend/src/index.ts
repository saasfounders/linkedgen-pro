import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth';
import { leadRoutes } from './routes/leads';
import { messageRoutes } from './routes/messages';
import { icpRoutes } from './routes/icp';
import { telegramRoutes } from './routes/telegram';
import { adminRoutes } from './routes/admin';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '10000', 10);

app.use(cors({
  origin: [
    process.env.APP_URL || 'http://localhost:3000',
    'https://saas-deployment-app-5vor3r1d.devinapps.com',
    'https://saas-deployment-app-ifpwsu4g.devinapps.com',
    /\.devinapps\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Request-ID', 
    'Cache-Control', 
    'Pragma', 
    'Expires',
    'X-Fallback-Request',
    'Accept'
  ]
}));

app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || `server-${Date.now()}`;
  const isFallback = req.headers['x-fallback-request'] === 'true';
  
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path}${isFallback ? ' [FALLBACK]' : ''}`, {
    requestId,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']?.substring(0, 100),
    contentType: req.headers['content-type'],
    cacheControl: req.headers['cache-control'],
    ip: req.ip || req.connection.remoteAddress,
    isFallback
  });
  
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Server-Time', new Date().toISOString());
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/icp', icpRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/health/detailed', async (req, res) => {
  try {
    const diagnostics = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasAppUrl: !!process.env.APP_URL,
        databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'NOT_SET'
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      },
      database: {
        status: 'CHECKING'
      } as any
    };

    try {
      const { query } = await import('./utils/database');
      const result = await query('SELECT NOW() as current_time');
      diagnostics.database = {
        status: 'CONNECTED',
        currentTime: result.rows[0]?.current_time,
        connectionTest: 'SUCCESS'
      };
    } catch (dbError: any) {
      diagnostics.database = {
        status: 'ERROR',
        error: dbError.message,
        code: dbError.code
      };
    }

    res.json(diagnostics);
  } catch (error: any) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Database URL configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
  console.log(`JWT Secret configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
});

export default app;
