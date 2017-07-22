// Authenticating on a per-API-basis. You don't need to do this if you auth on a
// global basis (see Authentication section above).
const config = require('../config/index');
const bigquery = require('@google-cloud/bigquery');

const bigqueryClient = bigquery(config.get('gcp'));

// Access an existing dataset and table.
const schoolsDataset = bigqueryClient.dataset('teamwork');
const schoolsTable = schoolsDataset.table('timeEntriesNew');

// Import data into a table.
schoolsTable.import('/tmp/timeEntries.json', (err, job) => {
  console.log(err);
  console.log(job);
});
/*
// Get results from a query job.
var job = bigqueryClient.job('job-id');

// Use a callback.
job.getQueryResults(function(err, rows) {});

// Or get the same results as a readable stream.
job.getQueryResults().on('data', function(row) {});
*/
