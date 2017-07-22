const config = require('../config');
const Db = require('../db');
const debug = require('debug')('teamwork-analytics:BigQueryCrawler');
const moment = require('moment');
const BigQuery = require('@google-cloud/bigquery');

class BigQueryCrawler {
  constructor() {
    this.db = new Db(`mongodb://${config.get('database.host')}/${config.get('database.name')}`);
  }

  execute(data) {
    debug('% j', data);
    const insertRowsAsStream = ({ datasetId, tableId, rows }) => new Promise((resolve, reject) => {
      BigQuery(config.get('gcp'))
        .dataset(datasetId)
        .table(tableId)
        .insert(rows)
        .then((insertErrors) => {
          if (insertErrors && insertErrors.length > 0) {
            reject(`ERROR: ${JSON.stringify(insertErrors, null, 2)}`);
          } else {
            resolve('Successfully Inserted');
          }
        })
        .catch((err) => {
          reject(`ERROR:${err}`);
        });
    });

    const getTimeEntries = () => {
      debug('Getting time entries from the database');
      return this.db.getAllTimeEntries();
    };

    getTimeEntries().then((res) => {
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

      insertRowsAsStream(params);
    });
  }
}

module.exports = BigQueryCrawler;
