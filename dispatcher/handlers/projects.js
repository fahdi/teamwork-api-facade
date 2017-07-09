'use strict';

const _ = require('lodash');
const debug = require('debug')('teamwork-analytics:projectsFetcher:Handler');

class ProjectsFetcher {

  constructor(name, db, queue) {
    this.name = name;
    this.db = db;
    this.queue = queue;
  }

  addJobs(data) {
    data = data || {};
    debug('adding jobs');

    return this.queue.addJob({
          name: 'projectsFetcher',
          data: null
        })
      .then(jobs => {
        debug('added %d product jobs', jobs.length);
        return jobs;
      });
  }

  handleResult(data, result) {
    debug('handling results %j, %j', data, result);
    return true;
  }

  handleError(data, error) {
    console.log('log the error');
  }

}

module.exports = ProjectsFetcher;
