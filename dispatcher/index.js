const _ = require('lodash');
const debug = require('debug')('teamwork-analytics:dispatcher');

const JOBS = {
  PROJECTS: {
    TITLE: 'projectsFetcher',
    HANDLER: require('./handlers/projects'),
    CRAWLER: require('../crawlers/projects'),
    CONCURRENCY: 1,
    NEXT: 'TIMEENTRIES'
  },
  TIMEENTRIES: {
    TITLE: 'timeEntriesFetcher',
    HANDLER: require('./handlers/time-entries'),
    CRAWLER: require('../crawlers/time-entries'),
    CONCURRENCY: 1,
    NEXT: 'BIGQUERY'
  },
  BIGQUERY: {
    TITLE: 'bigQuery',
    HANDLER: require('./handlers/big-query'),
    CRAWLER: require('../crawlers/big-query'),
    CONCURRENCY: 1,
    NEXT: false
  }
};

class Dispatcher {
  constructor(db, queue) {
    this.db = db;
    this.queue = queue;

    this.queue.on('complete', (id, result) => {
      this.queue.getJob(id)
        .then(job => Promise.all([
          this.onJobComplete(this._getJOBEnum(job), job.data, result)
          // job.remove()
        ]));
    }).on('failed', (id, err) => {
      this.queue.getJob(id)
        .then((job) => {
          this.onJobFailed(this._getJOBEnum(job), job.data, err);
        });
    });

    // register a map of jobs and it's corresponding crawler
    // to be invoked by the queue.
    Object.keys(JOBS).forEach((key) => {
      const JOB = JOBS[key];
      debug('processing %j', JOB);
      this.queue.process(JOB.TITLE, JOB.CONCURRENCY, new JOB.CRAWLER());
    });

    // handlers for each job type to be invoked by this class
    // the handlers are responsible for adding the jobs and
    // saving the result of these jobs
    this.initHandlers();

    // list of running tasks
    this.running = [];
  }

  _getJOBEnum(job) {
    const key = _.findKey(JOBS, obj => obj.TITLE === job.type);
    return JOBS[key];
  }

  initHandlers() {
    debug('Initializing handlers');
    Object.keys(JOBS).forEach((key) => {
      const JOB = JOBS[key];
      JOB.HANDLER = new JOB.HANDLER(JOB.TITLE, this.db, this.queue);
    });
  }

  start() {
    const JOB = JOBS.PROJECTS;
    return JOB.HANDLER.addJobs()
      .then((jobs) => {
        debug('added %d jobs', _.flatten(jobs).length);
        // Keep inquiring the queue for the count of active jobs for each job-type.
        // If the queue has no active jobs for a job-type, re-add jobs from the database.
        return this.startJobs();
      });
  }

  startJobs() {
    debug('starting jobs');
    // Disabled for now, we need to use this to see when the system is done and update
    // system status likewise.
    // return this.watchJobs(0);
  }

  _getActiveJobsCount() {
    return this.queue.getStats()
      .then(stat => stat.activeCount + stat.delayedCount + stat.inactiveCount);
  }

  _getDelayInMillis(hours) {
    return hours * 60 * 60 * 1000;
  }

  addNextJobs(data, result, next) {
    if (!next) {
      return Promise.resolve();
    }
    return JOBS[next].HANDLER.addJobs(result, data);
  }

  onJobComplete(JOB, data, result) {
    debug('job is complete %j', JOB);
    return Promise.all([this.addNextJobs(data, result, JOB.NEXT),
      JOB.HANDLER.handleResult(data, result)]).then((res) => {
      debug('Handled all results');
    });
  }

  onJobFailed(JOB, data, err) {
    return JOB.HANDLER.handleError(data, err);
  }

  stop() {
    this.running = [];
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    return this.queue.flush()
      .then(() => {
        debug('queue stopped and flushed!!');
      });
  }

  pause() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    return this.queue.pause();
  }

  getRunningJobs(ignoreKeyList) {
    const ignoreKeys = ignoreKeyList || ['failedCount', 'completeCount', 'delayedCount'];
    debug(ignoreKeyList);
    return this.queue.getStatsByJobs(Object.keys(JOBS).map(key => JOBS[key].TITLE))
      .then(stats => _.flatten(_.map(stats, (obj, key) =>
        _.filter(obj, (value, key) => (!_.includes(ignoreKeys, key) && value !== 0)))));
  }
}

module.exports = Dispatcher;
