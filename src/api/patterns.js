const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/', async (req, res) => {
  db.all('SELECT * FROM patterns ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', async (req, res) => {
  const { name, algorithm_version, template_data } = req.body;
  db.run(
    'INSERT INTO patterns (name, algorithm_version, template_data) VALUES (?, ?, ?)',
    [name, algorithm_version, JSON.stringify(template_data)],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

module.exports = router;