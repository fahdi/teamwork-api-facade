'use strict';

const _ = require('lodash');
const debug = require('debug')('teamwork-analytics:projectsHandler');

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
        data: data
      })
      .then(jobs => {
        debug('added %d projectsFetcher jobs', jobs.length);
        return jobs;
      });
  }

  handleResult(data, result) {
    debug('handling projects results');
    return this.db.saveAllProjects(JSON.parse(result));
  }

  handleError(data, error) {
    console.log('log the error');
  }

}

module.exports = ProjectsFetcher;
