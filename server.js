import dotenv from 'dotenv';
dotenv.config();

import app from './server/src/app.js';

const PORT = 3000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`[Sahafi Rent Book] Full-stack application running at http://${HOST}:${PORT}`);
  console.log(`[Sahafi Rent Book] API ready at http://${HOST}:${PORT}/api/health`);
});

export default server;
