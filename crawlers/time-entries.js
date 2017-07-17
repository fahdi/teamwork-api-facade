'use strict';

const config = require('../config');
const debug = require('debug')('teamwork-analytics:TimeEntriesCrawler');
const rp = require('request-promise');
const _ = require('lodash');
const Promise = require("bluebird");
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

    var loop = pageNumber => {
      options.qs.page = pageNumber;
      debug(`URL = ${options.uri}?page=${options.qs.page}`);
      return Promise.try(function() {
        return rp(options);
      }).delay(100).then(function(response) {
        if (JSON.parse(response).originalHeaders["x-pages"] > pageNumber) {
          //if (pageNumber < 1) {
          return Promise.try(function() {
            return loop(pageNumber + 1);
          }).then(function(recursiveResults) {
            return JSON.parse(response).body.concat(recursiveResults);
          });
        } else {
          // Done looping 
          return JSON.parse(response).body;
        }
      });
    }

    return new Promise.try(function() {
        return loop(1);
      }).then(function(results) {
        /*
        const file = '/tmp/teamwork-analytics/time-entries/all.json';
        jsonfile.writeFile(file, camelKeys(results, true), function(err) {
          console.error(err);
        });
        */
        return results;

      })
      .catch(function() {
        debug("Promise Rejected");
      });

  }
}

module.exports = TimeEntriesCrawler;
