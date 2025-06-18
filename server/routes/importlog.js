const express = require('express');
const router = express.Router();
const ImportLog = require('../models/ImportLog');

router.get('/', async (req, res) => {
  try {
    const logs = await ImportLog.find().sort({ importDatetime: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
