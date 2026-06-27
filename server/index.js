import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compareRouter from './routes/compare.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/compare', compareRouter);

app.get('/api/health', (_req, res) => {
  const hasKey = Boolean(process.env.FMP_API_KEY && process.env.FMP_API_KEY !== 'your_api_key_here');
  res.json({ ok: true, apiKeyConfigured: hasKey });
});

app.listen(PORT, () => {
  console.log(`Company Metrics Compare running at http://localhost:${PORT}`);
});
