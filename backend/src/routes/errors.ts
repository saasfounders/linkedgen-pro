import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

interface ErrorReport {
  message: string;
  name: string;
  stack?: string;
  context: any;
  timestamp: string;
  url: string;
  userAgent: string;
}

router.post('/report', async (req: Request, res: Response) => {
  try {
    const errorReport: ErrorReport = req.body;
    
    console.error('🚨 Client Error Report:', {
      timestamp: new Date().toISOString(),
      message: errorReport.message,
      name: errorReport.name,
      context: errorReport.context,
      url: errorReport.url,
      userAgent: errorReport.userAgent?.substring(0, 100),
      clientTimestamp: errorReport.timestamp
    });
    
    res.json({ 
      status: 'received',
      timestamp: new Date().toISOString(),
      reportId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
  } catch (error) {
    console.error('Failed to process error report:', error);
    res.status(500).json({ error: 'Failed to process error report' });
  }
});

export { router as errorRoutes };
