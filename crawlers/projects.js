'use strict';

const config = require('../config');
const debug = require('debug')('teamwork-analytics:projectsFetcher:Cralwer');

class ProjectsCrawler {
  constructor() {
    this.daddu = 'abc';
  }  

  execute(data) {
    debug('getting the projects for %j', data);    
	const wait = time => new Promise((resolve) => setTimeout(resolve, time));	
	return wait(3000).then(() => console.log('Hello!')); // 'Hello!';
  }
}

module.exports = ProjectsCrawler;
