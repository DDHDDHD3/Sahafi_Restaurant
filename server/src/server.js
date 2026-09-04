import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`[Sahafi Rent Book Server] running at http://${HOST}:${PORT}`);
  console.log(`[Sahafi Rent Book Server] API available at http://${HOST}:${PORT}/api/health`);
});

export default server;
