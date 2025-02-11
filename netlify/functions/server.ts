import serverless from 'serverless-http';
import { app } from '../../server/index';

// Export the serverless handler
export const handler = serverless(app);
