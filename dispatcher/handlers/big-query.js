const _ = require('lodash');
const debug = require('debug')('teamwork-analytics:BigQueryResults');

class BigQueryResults {

  constructor(name, db, queue) {
    this.name = name;
    this.db = db;
    this.queue = queue;
  }

  addJobs(data) {
    debug('adding bigQuery jobs');

    return this.queue.addJob({
      name: 'bigQuery',
      data: data
    })
      .then(jobs => {
        debug('added %d bigQuery jobs', jobs.length);
        return jobs;
      });
  }

  handleResult(data, result) {
    debug('pushed all time entries to big query');
    return Promise.resolve(true);
  }

  handleError(data, error) {
    console.log('log the error');
  }

}

module.exports = BigQueryResults;
