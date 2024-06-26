const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

module.exports = async (req, res) => {
  const datasetPath = path.join(__dirname, '../public/data/cleaned_sobeys.csv');
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
};