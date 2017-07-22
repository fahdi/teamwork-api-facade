const config = require('../config/index');
const Db = require('../db/index');
const db = new Db(`mongodb://${config.get('database.host')}/${config.get('database.name')}`);
const debug = require('debug')('teamwork-analytics:BigQuery');
const moment = require('moment');

const insertRowsAsStream = ({ datasetId, tableId, rows }) => new Promise((resolve, reject) => {
  const BigQuery = require('@google-cloud/bigquery');

  // Instantiates a client
  const bigQuery = BigQuery(config.get('gcp'));

  debug('insertRowAsStream rows = ', JSON.stringify(rows, null, 2));

  // Inserts data into a table
  bigQuery
    .dataset(datasetId)
    .table(tableId)
    .insert(rows)
    .then((insertErrors) => {
      debug('Inserted:');
      rows.forEach((row) => debug(row));

      if (insertErrors && insertErrors.length > 0) {
        debug('Insert errors:');

        insertErrors.forEach((err) => debug(err));
        reject('ERROR: ' + JSON.stringify(insertErrors, null, 2));
      } else {
        resolve('Sucessfully Inserted')
      }
    })
    .catch((err) => {

      debug('ERROR:', err);
      reject('ERROR:' + err);

    });

});

const getTimeEntries = () => {
  debug('Getting time entries from the database');
  return db.getAllTimeEntries();
};

getTimeEntries().then((res) => {
  //debug('Time entries from the database = %j', res);
  let data = res.map(o => {
    return {
      date: o.date,
      project: o.projectName,
      company: o.companyName,
      who: o.personFirstName + ' ' + o.personLastName,
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
    }
  });

  //debug('data %o', data);

  const params = {
    datasetId: "teamwork",
    tableId: "timeEntries",
    rows: data
  };
  insertRowsAsStream(params);
});
