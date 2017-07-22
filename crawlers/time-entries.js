const config = require('../config');
const debug = require('debug')('teamwork-analytics:TimeEntriesCrawler');
const rp = require('request-promise');
const _ = require('lodash');
const Promise = require('bluebird');
const camelKeys = require('camel-keys');
const jsonfile = require('jsonfile');
const uuidv1 = require('uuid/v1');
const uuidv4 = require('uuid/v4');

class TimeEntriesCrawler {
  constructor() {
    this.url = `${config.get('facadeApi.url')}${config.get('facadeApi.paths.timeEntries')}`;
  }

  execute(data) {
    data = data || {};
    debug('getting the time entries');

    const options = {
      method: 'GET',
      uri: `${config.get('facadeApi.url')}${config.get('facadeApi.paths.timeEntries')}`,
      qs: {
        page: 1
      },
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/json'
      }
    };

    var loop = (pageNumber) => {
      options.qs.page = pageNumber;
      debug(`URL = ${options.uri}?page=${options.qs.page}`);
      return Promise.try(() => rp(options)).delay(100).then((response) => {
        // if (pageNumber < JSON.parse(response).originalHeaders['x-pages']) {
        if (pageNumber < 1) {
          return Promise.try(() => loop(pageNumber + 1))
            .then(recursiveResults => JSON.parse(response).body.concat(recursiveResults));
        }
        // Done looping 
        return JSON.parse(response).body;
      });
    };

    return Promise.try((() => loop(1))).then(results => results)
      .catch(() => {
        debug('Promise Rejected');
      });
  }
}

module.exports = TimeEntriesCrawler;
