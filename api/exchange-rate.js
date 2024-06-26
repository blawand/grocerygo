const fetch = require('node-fetch');
require('dotenv').config();

module.exports = async (req, res) => {
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
};