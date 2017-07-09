'use strict';

const _ = require('lodash');
const config = require('../config');
const debug = require('debug')('teamwork-analytics:queue');
const EventEmitter = require('events');
const kue = require('kue');
const Processor = require('./processor');
const promisify = require('es6-promisify');
const redis = require('redis');

class Queue extends EventEmitter {

  constructor() {
    super();

    this.queue = kue.createQueue({redis: config.get('redis'), jobEvents: false});
    this.queue.watchStuckJobs(1000);
    this.queue
      .on('job enqueue', (id, type) => {
        debug('#%d enqueue %s', id, type);
        this.emit('enqueue', id, type);
      })
      .on('job failed attempt', (id, err, attempt) => {
        debug('#%d failed attempt %d error %s', id, attempt, err);
        this.emit('failed attempt', id, err, attempt);
      })
      .on('job failed', (id, err) => {
        debug('#%d failed %s', id, err);
        this.emit('failed', id, err);
      })
      .on('job complete', (id, result) => {
        this.emit('complete', id, result);
      });

    this.processor = new Processor(this.queue);
  }

  addJob(job) {
    const queueTask = this.queue
      .create(job.name, job.data)
      .ttl(config.get('jobTTLTimeout'))
      .delay(job.delay || 0)
      .attempts(job.attempts || config.get('jobAttempts'))
      .backoff(job.backoff || config.get('jobBackoff'));

    return promisify(queueTask.save.bind(queueTask))()
      .then(() => queueTask)
      .catch(err => {
        debug('err saving task of type %s into the queue', job.type);
        debug(err);
      });
  }

  getJob(id) {
    return promisify(kue.Job.get)(id);
  }

  process(title, concurrency, handler) {
    this.processor.process(title, concurrency, handler);
  }

  pause() {
    return this.queue.workers.map(worker => Promise.all(
      promisify(worker.shutdown.bind(worker))()
    ));
  }

  flush() {
    return new Promise((resolve, reject) => {
      const client = redis.createClient({
        'url': config.get('redis')
      });
      client.flushdb((err, success) => {
        client.end(true);
        if (err) return reject(err);
        resolve(success);
      });
    });
  }

  shutdown() {
    return promisify(this.queue.shutdown.bind(this.queue))(5000);
  }

  getStats(job) {
    const stats = ['activeCount', 'inactiveCount', 'completeCount', 'failedCount', 'delayedCount'];
    return Promise.all(stats.map(stat => promisify(this.queue[stat].bind(this.queue))(job)))
      .then(values => _.zipObject(stats, values));
  }

  getStatsByJobs(jobs) {
    return Promise.all(jobs.map(job => this.getStats(job)))
      .then(values => _.zipObject(jobs, values));
  }

}

module.exports = Queue;
