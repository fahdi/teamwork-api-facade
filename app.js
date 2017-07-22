const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config');
const Db = require('./db');
const debug = require('debug')('teamwork-analytics:app.js');
const Dispatcher = require('./dispatcher');
const express = require('express');
const logger = require('morgan');
const path = require('path');
// const Promise = require('bluebird');

const Queue = require('./queue/queue');
const redis = require('redis');
const mongoose = require('mongoose');

const app = express();
// Routes
const index = require('./routes/index');
const projects = require('./routes/projects');
const timeEntries = require('./routes/time-entries');
// Kue Setup
const kue = require('kue');
const kueUI = require('kue-ui');

// Redis and everything Queue related
const client = redis.createClient({
  url: config.get('redis')
});

client.on('error', (err) => {
  debug('The redis server is not available. \n Redis server needs to starts or bad connection string in config. Please check! \n  %s\n Trying to reconnect to redis.', err);
});

client.on('connect', () => {
  debug('The redis server is available. Continuing with the queue!');

  const uri = `mongodb://${config.get('database.host')}/${config.get('database.name')}`;
  const options = config.get('database.options');

  const connection = mongoose.connection.openUri(uri, options);

  connection.on('open', () => {
    // Setup Queue
    const queue = new Queue();

    kueUI.setup({
      apiURL: '/kue-api',
      baseURL: '/queue',
      updateInterval: 5000
    });

    app.use('/kue-api', kue.app);
    app.use('/queue', kueUI.app);

    const db = new Db(uri, options);
    const dispatcher = new Dispatcher(db, queue);
    dispatcher.start();
  });

  connection.on('error', () => {
    debug('No connection, retry');
  });

  debug('Come here');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/projects', projects);
app.use('/time-entries', timeEntries);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
