import { ensureDb, isDbReady } from '../server/src/db.js';
import { createApp } from '../server/src/app.js';
import { seedData } from '../server/src/seed.js';
import { apiKeyCount } from '../server/src/security.js';

const app = createApp(null);

async function ensureSeed() {
  if (globalThis.__hospitalqSeeded) return;
  await seedData();
  globalThis.__hospitalqSeeded = true;
}

export default async function handler(req, res) {
  const connected = await ensureDb();
  if (!connected || !isDbReady()) {
    const hasUri = Boolean(process.env.MONGODB_URI || process.env.MONGO_URI);
    res.status(503).json({
      success: false,
      message: hasUri
        ? 'Database is not connected. Check MongoDB Atlas Network Access (allow 0.0.0.0/0 for Vercel) and that atlas-hospita is linked to this project.'
        : 'MONGODB_URI is missing on Vercel. Link atlas-hospita to hospitalq-webapp or add MONGODB_URI in project settings.',
      error: 'DB_NOT_CONNECTED',
    });
    return;
  }

  if (!globalThis.__hospitalqKeyLog) {
    console.log(`API keys loaded: ${apiKeyCount()}`);
    globalThis.__hospitalqKeyLog = true;
  }

  try {
    await ensureSeed();
  } catch (error) {
    console.error('Seed error:', error);
  }

  return app(req, res);
}
