const config = require('../config');
const Db = require('../db');
const debug = require('debug')('teamwork-analytics:BigQueryCrawler');
const moment = require('moment');
const Promise = require('bluebird');
const BigQuery = require('@google-cloud/bigquery');

class BigQueryCrawler {
  constructor() {
    this.db = new Db(`mongodb://${config.get('database.host')}/${config.get('database.name')}`);
  }

  execute(data) {
    debug('execute %j', data);
    const insertRowsAsStream = ({ datasetId, tableId, rows }) => new Promise((resolve, reject) => {
      BigQuery(config.get('gcp'))
        .dataset(datasetId)
        .table(tableId)
        .insert(rows)
        .then(() => resolve('Successfully Inserted'))
        .catch((err) => {
          debug('ERROR:', err);
          reject(`ERROR:${err}`);
        });
    });

    return this.db.getAllTimeEntries().then((res) => {
      const timeEntries = res.map(o => ({
        date: o.date,
        project: o.projectName,
        company: o.companyName,
        who: `${o.personFirstName} ${o.personLastName}`,
        hours: o.hours,
        minutes: o.minutes,
        decimalHours: (o.hours + (o.minutes / 60)).toFixed(2),
        description: o.description,
        taskList: o.todoListName,
        task: o.todoItemName,
        parentTask: o.parentTaskName,
        isSubTask: o.taskIsSubTask,
        isItBillable: o.isbillable,
        attachedTask: o.taskIsSubTask ? o.parentTaskName : o.todoItemName ? o.todoItemName : 'NO TASK FOUND',
        yearDate: moment(o.date).format('YYYYMMDD')
      }));

      const params = {
        datasetId: 'teamwork',
        tableId: 'timeEntries',
        rows: timeEntries
      };

      return insertRowsAsStream(params);
    });
  }
}

module.exports = BigQueryCrawler;
