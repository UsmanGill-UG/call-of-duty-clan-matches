require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');

const userRouter = require('./routes/user');
const clanRouter = require('./routes/clan');
const matchRouter = require('./routes/match');
const mapRouter = require('./routes/map');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/user', userRouter);
app.use('/api/clan', clanRouter);
app.use('/api/match', matchRouter);
app.use('/api/map', mapRouter);

const port = 3000;

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
