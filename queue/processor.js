'use strict';

const config = require('../config');
const debug = require('debug')('pricealert:processor');

/**
 * Task processor
 *
 */
class Processor {
  /**
   * Constructor
   * @param kue - kue instance
   */
  constructor(kue) {
    this.kue = kue;
  }

  /**
   * Subscribe to task
   * @param eventName - task event name
   * @param handler {TaskBase} - task handler
   * @returns {Processor} - Processor for chaining
   */
  process(eventName, concurrency, handler) {
    debug('processing %s', eventName);
    this.kue.process(eventName, concurrency, (job, done) => {
      const domain = require('domain').create();
      domain.on('error', (err) => {
        debug('domain error %s', err);
        done(err);
      });

      domain.run(() => {
        debug('handling %s', JSON.stringify(job.data));
        const timeout = setTimeout(() => {
          debug('failing with timeout');
          done(new Error('timeout'));
        }, config.get('jobTimeout'));
        handler
          .execute(job.data)
          .then(result => {
            clearTimeout(timeout);
            debug('result %s', JSON.stringify(result));
            done(null, result);
          })
          .catch(err => {
            clearTimeout(timeout);
            debug('failing %s. %s', err, err.stack);
            done(err);
          });
      });
    });

    return this;
  }
}

module.exports = Processor;
