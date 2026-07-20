require('dotenv').config();

const path = require('path');
const express = require('express');
const indexRouter = require('./routes/index');
const gameRouter  = require('./routes/game');
const apiRouter   = require('./routes/apiRouter');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1m' }));

// -- Routes --
app.use('/', indexRouter);
app.use('/game',gameRouter);
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Magnus is running at http://localhost:${PORT}`);
});

module.exports = app;
