import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeData, searchSchools, getSchoolByName, getAllCCAs, getRandomSchool } from './server/dataService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize data from local seed / data.gov.sg
  initializeData();

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', source: 'data.gov.sg Collection 457' });
  });

  // Random school gacha
  app.get('/api/random', (req, res) => {
    try {
      const school = getRandomSchool();
      if (school) {
        res.json(school);
      } else {
        res.status(404).json({ error: 'No schools loaded' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to pick random school' });
    }
  });

  // Search Schools and CCAs
  app.get('/api/search', (req, res) => {
    try {
      const {
        q,
        query,
        level,
        zone,
        ccaCategory,
        nature,
        isAutonomous,
        isSap,
        isIp,
        isGifted,
        page,
        limit,
      } = req.query;

      const results = searchSchools({
        query: (q || query || '') as string,
        level: level as string,
        zone: zone as string,
        ccaCategory: ccaCategory as string,
        nature: nature as string,
        isAutonomous: isAutonomous === 'true',
        isSap: isSap === 'true',
        isIp: isIp === 'true',
        isGifted: isGifted === 'true',
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });

      res.json(results);
    } catch (err) {
      console.error('Search API error:', err);
      res.status(500).json({ error: 'Failed to search schools' });
    }
  });

  // Get specific school details
  app.get('/api/schools/:name', (req, res) => {
    try {
      const school = getSchoolByName(decodeURIComponent(req.params.name));
      if (school) {
        res.json(school);
      } else {
        res.status(404).json({ error: 'School not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve school' });
    }
  });

  // Get all unique CCAs
  app.get('/api/ccas', (req, res) => {
    try {
      const ccas = getAllCCAs();
      res.json(ccas);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve CCAs' });
    }
  });

  // Get Collection 457 Live Metadata
  app.get('/api/collection-metadata', async (req, res) => {
    try {
      const metaRes = await fetch('https://api-production.data.gov.sg/v2/public/api/collections/457/metadata');
      const meta = await metaRes.json();
      res.json(meta);
    } catch (err) {
      res.json({
        code: 0,
        data: {
          collectionMetadata: {
            collectionId: '457',
            name: 'School Directory and Information',
            managedBy: 'Ministry of Education',
          },
        },
      });
    }
  });

  // Vite Middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 School & CCA Explorer server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
