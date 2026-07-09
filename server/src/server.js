import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { createApp } from './app.js';
import { initSocket } from './socket/index.js';

dotenv.config();

const startServer = async () => {
  await connectDB();

  const ioHolder = { io: null };
  const app = createApp(ioHolder);
  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  });

  ioHolder.io = io;
  initSocket(io);

  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`HospitalQ server running on http://localhost:${PORT}`);
  });
};

startServer();
