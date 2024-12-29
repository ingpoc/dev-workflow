const express = require('express');
const router = express.Router();
const db = require('./db');
const PatternDetector = require('../utils/patternDetector');

const detector = new PatternDetector(db);

router.post('/analyze', async (req, res) => {
  try {
    const { sourceCode } = req.body;
    if (!sourceCode) {
      return res.status(400).json({ error: 'Source code is required' });
    }

    const patterns = await detector.analyze(sourceCode);
    res.json({ patterns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const patterns = await db.all(
      'SELECT DISTINCT name, template_data FROM patterns WHERE validation_status = ?',
      ['valid']
    );
    res.json(patterns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;