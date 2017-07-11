'use strict';

const _ = require('lodash');
const debug = require('debug')('teamwork-analytics:db');
const fs = require('fs');
const mongoose = require('mongoose');
const Project = require('./models/project');
const TimeEntry = require('./models/time-entry');

class Db {

  constructor(connectionString) {
    if (mongoose.connection.readyState === 0) {
      mongoose.connect(connectionString, {
        useMongoClient: true,
        /* other options */
      });
    }
  }  

  saveAllProjects(projects) {
    Project.collection.remove(); 
    let data = _.cloneDeep(projects);
    const now = new Date();
    data = _.map(data, o => _.extend({ updatedAt: now, createdAt: now }, o));
    debug('Projects: %s', data);
    return Project.collection.insert(data);
  }

  saveAllTimeEntries(timeEntries) {    
    TimeEntry.collection.remove(); 
    let data = _.cloneDeep(timeEntries);
    const now = new Date();
    data = _.map(data, o => _.extend({ updatedAt: now, createdAt: now }, o));
    debug('TimeEntries: %s', data);
    return TimeEntry.collection.insert(data);
  }

  getProjects(query, limit) {
    return Project.find(query).limit(limit ? limit : 0).exec();
  }

  getProjectsCsv() {
    return Project.findAndStreamCsv({});
  }

  purgeProjectsCollection() {
    return Project.collection.remove();
  }

  saveProjectsCsv() {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString().replace(/T/, '-').replace(/\..+/, '');
      const csvPath = `downloads/Projects-${now}.csv`;
      const csvWriter = Project.findAndStreamCsv({}).pipe(fs.createWriteStream(csvPath));
      csvWriter.on('finish', () => {
        // TODO: Automate cleaning when the queues are all done
        resolve(csvPath);
      });
    });
  }

  updateProjects(query, update) {
    return Project.update(query, {$set: update}, {multi: true}).exec();
  }
  

  reset() {
    return Promise.all([
      this.resetLinks()
    ]);
  }

}

module.exports = Db;
