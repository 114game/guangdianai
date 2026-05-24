import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import logger from './config/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制100次
  message: '请求过于频繁，请稍后再试'
});
app.use(limiter);

// 路由
app.use('/api', routes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Server error:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  console.log(`Server is running on http://localhost:${PORT}`);
});
