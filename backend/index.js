const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./src/socket');
const initSessionCleanupCron = require('./src/cron/sessionCleanup');

// Load env vars
dotenv.config();

// Connect to database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
  "https://frontend-pink-rho-s0gl23uxb5.vercel.app"
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  allowEIO3: true,
});

app.set('io', io);
socketHandler(io);
initSessionCleanupCron(io);

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
const googleDriveRoutes = require('./src/routes/googleDrive');
const teacherDatasetRoutes = require('./src/routes/teacher/datasets');
const teacherQuizRoutes = require('./src/routes/teacher/quizzes');
const teacherRoomRoutes = require('./src/routes/teacher/room');
const teacherPerformanceRoutes = require('./src/routes/teacher/performance');
const studentQuizRoutes = require('./src/routes/student/quizzes');
const studentRoomRoutes = require('./src/routes/student/room');
const adminUserRoutes = require('./src/routes/admin/manageUsers');
const adminDataAccessRoutes = require('./src/routes/admin/dataAccess');
const globalAuthRoutes = require('./src/routes/global/auth');
const superAdminOrgRoutes = require('./src/routes/superAdmin/manageOrganizations');
const superAdminUserRoutes = require('./src/routes/superAdmin/userRoutes');
const superAdminQuizRoutes = require('./src/routes/superAdmin/quizzes');
const superAdminDatasetRoutes = require('./src/routes/superAdmin/datasets');

// Basic Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/drive', googleDriveRoutes);
app.use('/api/teacher/datasets', teacherDatasetRoutes);
app.use('/api/teacher/quizzes', teacherQuizRoutes);
app.use('/api/teacher/rooms', teacherRoomRoutes);
app.use('/api/teacher/performance', teacherPerformanceRoutes);
app.use('/api/student/quizzes', studentQuizRoutes);
app.use('/api/student/rooms', studentRoomRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/data-access', adminDataAccessRoutes);
app.use('/api/auth', globalAuthRoutes);
// Super Admin routes
app.use('/api/super-admin/organizations', superAdminOrgRoutes);
app.use('/api/super-admin/users', superAdminUserRoutes);
app.use('/api/super-admin/quizzes', superAdminQuizRoutes);
app.use('/api/super-admin/datasets', superAdminDatasetRoutes);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, server };
