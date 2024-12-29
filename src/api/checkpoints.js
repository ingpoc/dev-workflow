const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/', (req, res) => {
  db.all('SELECT * FROM project_checkpoints ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { session_id, state_snapshot } = req.body;
  db.run(
    'INSERT INTO project_checkpoints (session_id, state_snapshot) VALUES (?, ?)',
    [session_id, JSON.stringify(state_snapshot)],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

router.get('/:id', (req, res) => {
  db.get('SELECT * FROM project_checkpoints WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Checkpoint not found' });
    res.json(row);
  });
});

module.exports = router;