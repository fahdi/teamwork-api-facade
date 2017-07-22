const config = require('../config');
const debug = require('debug')('teamwork-analytics:ProjectsCrawler');
const rp = require('request-promise');

class ProjectsCrawler {
  constructor() {
    this.url = `${config.get('facadeApi.url')}${config.get('facadeApi.paths.projects')}`;
  }

  execute(data) {
    debug('getting the projects');
    debug('getting the projects for data %j', data);

    const options = {
      method: 'GET',
      url: this.url,
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/json'
      }
    };

    return rp(options)
      .then(response => response)
      .catch((err) => {
        throw new Error(err);
      });
  }
}

module.exports = ProjectsCrawler;
