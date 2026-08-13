import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import issueRoutes from './routes/issue.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/issues', issueRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

export default app;
