const express = require('express');
const router = express.Router();
const pool   = require('../lib/db');

const { renderDashBoard } = require('../lib/renderPage');

router.get('/', async (req, res) => {
  try {
    renderDashBoard (res, 'dashboard', {
      
      }
    );  
  }
  catch (err) {
    console.error(err);
    res.status(500).send('Databas Error');
  }
});

module.exports = router;
