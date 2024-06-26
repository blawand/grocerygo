const fetch = require('node-fetch');
require('dotenv').config();

module.exports = async (req, res) => {
  const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
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
};