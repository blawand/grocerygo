const express = require('express');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

console.log('Current working directory:', process.cwd());

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

(async () => {
  const fetch = (await import('node-fetch')).default;

  const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!unsplashAccessKey) {
    console.error('UNSPLASH_ACCESS_KEY is not set');
  }

  app.get('/api/exchange-rate', async (req, res) => {
    const exchangeRateApi = process.env.EXCHANGE_RATE_API;
    console.log('Fetching exchange rate from:', exchangeRateApi);
    try {
      const response = await fetch(exchangeRateApi);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      res.json({ rate: data.rates.CAD });
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      res.status(500).json({ error: 'Failed to fetch exchange rate' });
    }
  });

  app.get('/api/dataset', async (req, res) => {
    const datasetPath = path.join(__dirname, 'public', 'data', 'cleaned_sobeys.csv');
    console.log('Reading dataset from:', datasetPath);
    try {
      const data = await fs.readFile(datasetPath, 'utf8');
      const items = data.split('\n').slice(1).map(row => {
        const cols = row.split(',');
        return {
          title: cols[0].replace(/"/g, ''),
          price: cols[1],
          weight: cols[2],
          unit: cols[3]
        };
      });
      res.json(items);
    } catch (error) {
      console.error('Error reading dataset:', error);
      res.status(500).json({ error: 'Failed to read dataset', details: error.message });
    }
  });

  app.get('/api/unsplash-image', async (req, res) => {
    const searchTerm = req.query.query;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&client_id=${unsplashAccessKey}&per_page=3`;

    console.log('Fetching Unsplash image with URL:', url);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        res.json({ imageUrl: data.results[0].urls.regular });
      } else {
        res.json({ imageUrl: '' });
      }
    } catch (error) {
      console.error('Error fetching Unsplash image:', error);
      res.status(500).json({ error: 'Failed to fetch image' });
    }
  });

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
})();