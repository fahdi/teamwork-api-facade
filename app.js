const _ = require('lodash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config');
const Db = require('./db');
const Dispatcher = require('./dispatcher');
const express = require('express');
const favicon = require('serve-favicon');
const logger = require('morgan');
const path = require('path');
const Queue = require('./queue/queue');

// Routes 
const index = require('./routes/index');
const projects = require('./routes/projects');
const timeEntries = require('./routes/time-entries');

// Kue Steup
const kue = require('kue');
const kueUI = require('kue-ui');

const app = express();

const db = new Db(`mongodb://${config.get('database.host')}/${config.get('database.name')}`);
const queue = new Queue();
const dispatcher = new Dispatcher(db, queue);
dispatcher.start();

kueUI.setup({
    apiURL: '/kue-api',
    baseURL: '/queue',
    updateInterval: 5000
});

app.use('/kue-api', kue.app);
app.use('/queue', kueUI.app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/projects', projects);
app.use('/time-entries', timeEntries);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
