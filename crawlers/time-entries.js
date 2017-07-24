const config = require('../config');
const debug = require('debug')('teamwork-analytics:TimeEntriesCrawler');
const rp = require('request-promise');
const Promise = require('bluebird');

class TimeEntriesCrawler {
  constructor() {
    this.url = `${config.get('facadeApi.url')}${config.get('facadeApi.paths.timeEntries')}`;
  }

  execute(data) {
    debug('getting the time entries %j', data);

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

    const loop = (pageNumber) => {
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
