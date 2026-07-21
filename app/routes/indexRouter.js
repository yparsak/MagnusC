const express = require('express');
const router = express.Router();
const pool   = require('../lib/db');

const { renderPage } = require('../lib/renderPage');

router.get('/', async (req, res) => {
  try {
    renderPage(res, '1pane', 'game', {
      
      }
    );  
  }
  catch (err) {
    console.error(err);
    res.status(500).send('Databas Error');
  }
});

module.exports = router;
