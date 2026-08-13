import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import issueRoutes from './routes/issue.routes';
import lostFoundRoutes from './routes/lostFound.routes';
import announcementRoutes from './routes/announcement.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/issues', issueRoutes);
app.use('/api/v1/lost-found', lostFoundRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Student Portal API is operational' });
});

export default app;
