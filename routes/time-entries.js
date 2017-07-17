var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var config = require('../config');
var _ = require('lodash');
var debug = require('debug')('teamwork-analytics:routes/time-entries');

var timersByProject = (id, page) => {
  debug("Page = " + page);
  debug("Project = " + id);
  var company = config.get('teamwork.company');
  var key = config.get('teamwork.apikey');

  var base64 = new Buffer(key + ":xxx").toString("base64");

  var options = {
    method: 'GET',
    uri: `http://${company}.teamwork.com/projects/${id}/time_entries.json?page=${page}`,
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      authorization: 'BASIC ' + base64
    }
  };

  return rp(options)
    .then(response => {
      let timeEntries = JSON.parse(response)['time-entries'];
      return timeEntries;
    })
    .catch(err => {
      debug(err.MESSAGE);
    });
}

var timers = (page) => {
  debug("Page= " + page);
  var company = config.get('teamwork.company');
  var key = config.get('teamwork.apikey');

  var base64 = new Buffer(key + ":xxx").toString("base64");

  var options = {
    method: 'GET',
    uri: `http://${company}.teamwork.com/time_entries.json?page=${page}`,
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      authorization: 'BASIC ' + base64
    },
    resolveWithFullResponse: true    
  };

  return rp(options)
    .then((response) => {      
      return { 'originalHeaders': response.headers, 'body': JSON.parse(response.body)['time-entries'] };
    })
    .catch(function(err) {
      debug(err.MESSAGE);
    });
}

/* GET timer listings for all projects. */
router.get('/', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  var project = req.query.project ? req.query.project : undefined;
  var page = req.query.page ? req.query.page : 1;
  if (project) {
    timersByProject(project, page).then(function(data) {
      debug("Time Entries for a specific project");
      res.send(data);
    });
  } else {
    timers(page).then(function(data) {
      debug("Time Entries for all projects");
      res.send(data);
    });
  }

});

module.exports = router;
