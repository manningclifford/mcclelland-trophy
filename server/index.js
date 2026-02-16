import express from 'express';
import cors from 'cors';
import { loadWormCache } from './services/wormCache.js';
import matchesRouter from './routes/matches.js';
import wormsRouter from './routes/worms.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load worm data from JSON cache
loadWormCache();

// Routes
app.use('/api', matchesRouter);
app.use('/api', wormsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
