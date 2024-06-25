const express = require('express');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

console.log('Current working directory:', process.cwd());

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Wrap the main application logic in an async IIFE
(async () => {
  // Dynamically import node-fetch
  const fetch = (await import('node-fetch')).default;

  const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

  // API endpoint to fetch exchange rate
  app.get('/api/exchange-rate', async (req, res) => {
    const exchangeRateApi = process.env.EXCHANGE_RATE_API;
    try {
      const response = await fetch(exchangeRateApi);
      const data = await response.json();
      res.json({ rate: data.rates.CAD });
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      res.status(500).json({ error: 'Failed to fetch exchange rate' });
    }
  });

  // API endpoint to fetch dataset
  app.get('/api/dataset', async (req, res) => {
    const datasetPath = path.join(__dirname, process.env.DATASET_PATH);
    console.log('Attempting to read file:', datasetPath);
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

  // API endpoint to fetch Unsplash image
  app.get('/api/unsplash-image', async (req, res) => {
    const searchTerm = req.query.query;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&client_id=${unsplashAccessKey}&per_page=3`;

    try {
        const response = await fetch(url);
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

  // Route for serving index.html for all routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  // Start the server
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
})();