const express = require('express');

const router = express.Router();
const rp = require('request-promise');
const config = require('../config');
const debug = require('debug')('teamwork-analytics:routes/time-entries');

const timersByProject = (id, page) => {
  debug(`Page = ${page}`);
  debug(`Project = ${id}`);
  const team = config.get('teamwork.team');
  const key = config.get('teamwork.apiKey');

  const base64 = new Buffer(`${key}:xxx`).toString('base64');

  const options = {
    method: 'GET',
    uri: `http://${team}.teamwork.com/projects/${id}/time_entries.json?page=${page}`,
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      authorization: `BASIC ${base64}`
    }
  };

  return rp(options)
    .then((response) => {
      const timeEntries = JSON.parse(response)['time-entries'];
      return timeEntries;
    })
    .catch((err) => {
      debug(err.MESSAGE);
    });
};

const timers = (page) => {
  debug(`Page= ${page}`);
  const team = config.get('teamwork.team');
  const key = config.get('teamwork.apiKey');

  const base64 = new Buffer(`${key}:xxx`).toString('base64');

  const options = {
    method: 'GET',
    uri: `http://${team}.teamwork.com/time_entries.json?page=${page}`,
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      authorization: `BASIC ${base64}`
    },
    resolveWithFullResponse: true
  };

  return rp(options)
    .then(response => ({ originalHeaders: response.headers, body: JSON.parse(response.body)['time-entries'] }))
    .catch((err) => {
      debug(err.MESSAGE);
    });
};

/* GET timer listings for all projects. */
router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const project = req.query.project ? req.query.project : undefined;
  const page = req.query.page ? req.query.page : 1;
  if (project) {
    timersByProject(project, page).then((data) => {
      debug('Time Entries for a specific project');
      res.send(data);
    });
  } else {
    timers(page).then((data) => {
      debug('Time Entries for all projects');
      res.send(data);
    });
  }
});

module.exports = router;
