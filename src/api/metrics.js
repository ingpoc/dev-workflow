const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/', (req, res) => {
  const query = `
    SELECT 
      date(created_at) as date,
      COUNT(DISTINCT p.id) as pattern_count,
      COUNT(DISTINCT c.id) as checkpoint_count
    FROM patterns p
    LEFT JOIN project_checkpoints c ON date(p.created_at) = date(c.created_at)
    GROUP BY date(created_at)
    ORDER BY date(created_at) DESC
    LIMIT 30
  `;
  
  db.all(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const metrics = rows.map(row => ({
      timestamp: row.date,
      patternReuse: row.pattern_count,
      contextAccuracy: ((row.checkpoint_count / row.pattern_count) * 100).toFixed(2)
    }));
    
    res.json(metrics);
  });
});

module.exports = router;