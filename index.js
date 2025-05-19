import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import tourScheduleRoutes from './routes/tourScheduleRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { v2 as cloudinary } from 'cloudinary';
// import { clearAllProperties, clearTransactionMetrics } from './utils/resetUtils.js';
// import { clearAllTransactions } from './utils/resetUtils.js';
// import { clearAllUsers } from './utils/resetUtils.js';
// import { clearAllNotifications, clearAllTourSchedules, } from './utils/resetUtils.js';
// import { uploadProperties } from './utils/propertiesDataExporter.js';
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};
app.use(cors(corsOptions));

app.get('/', (req, res) => {
  return res.status(200).json('Welcome DreamNest REALESTATE');
});
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tour', tourScheduleRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

io.on('connection', (socket) => {
  console.log('User connected ', socket.id);
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`${userId} joined the room`);
  });
  socket.on('send_notification', (userId, notificationData) => {
    io.to(userId).emit('notification', notificationData);
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ App connected to database');
    // clearAllNotifications()
    // clearAllTourSchedules()
    // clearAllTransactions();
    // clearAllProperties()
    // clearAllUsers()
    // clearTransactionMetrics()
    // clearTransactionMetrics()
    // uploadProperties()
    const url = `http://localhost:${process.env.PORT}`;
    server.listen(process.env.PORT, () => {
      console.log(`✅ App listening on: \x1b[32m%s\x1b[0m`, url);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  });

cloudinary.api
  .ping()
  .then(() => console.log('✅ App connected to cloud storage'))
  .catch((err) => console.error('❌ Cloudinary connection failed:', err));
