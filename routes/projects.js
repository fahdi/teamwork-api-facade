const express = require('express');

const router = express.Router();
const rp = require('request-promise');
const config = require('../config');

const projects = () => {
  const team = config.get('teamwork.team');
  const key = config.get('teamwork.apiKey');

  const base64 = new Buffer(`${key}:xxx`).toString('base64');

  const options = {
    method: 'GET',
    url: `http://${team}.teamwork.com/projects.json`,
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      authorization: `BASIC ${base64}`
    }
  };

  return rp(options)
    .then(response => JSON.parse(response).projects
      .map(({ id, name, description, logo, company }) => ({
        id,
        name,
        description,
        logo,
        companyName: company.name
      })))
    .catch((err) => {
      throw new Error(err);
    });
};

/* GET projects listing. */
router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  projects().then((data) => {
    res.send(data);
  });
});

module.exports = router;
