'use strict';

const _ = require('lodash');
const camelKeys = require('camel-keys');
const debug = require('debug')('teamwork-analytics:TimeEntriesHandler');

class TimeEntriesFetcher {

  constructor(name, db, queue) {
    this.name = name;
    this.db = db;
    this.queue = queue;
  }

  addJobs(data) {
    data = data || {};
    debug('adding jobs');

    return this.queue.addJob({
        name: 'timeEntriesFetcher',
        data: data
      })
      .then(jobs => {
        debug('added %d timeEntriesFetcher jobs', jobs.length);
        return jobs;
      });
  }

  handleResult(data, result) {    
    debug('Handling time-entries results, length = %d',result.length);
    return this.db.saveAllTimeEntries(camelKeys(result, true));
  }

  handleError(data, error) {
    console.log('log the error');
  }

}

module.exports = TimeEntriesFetcher;
