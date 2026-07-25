const express = require('express');
const router = express.Router();
const pool   = require('../lib/db');

const { renderPage } = require('../lib/renderPage');

router.get('/', async (req, res) => {
  try {
    renderPage (res,'main_template', 'board_editor', {
        mode: 'editor',
        title: 'Magnus - Board Editor',
        showPromotionLayer: false,
        pageData: {} 
      }
    );  
  }
  catch (err) {
    console.error(err);
    res.status(500).send('Databas Error');
  }
});

module.exports = router;
