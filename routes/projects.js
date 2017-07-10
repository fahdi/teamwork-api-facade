var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var config = require('../config');

var projects = () => {
  var company = config.get('teamwork.company');
  var key = config.get('teamwork.apikey');

  var base64 = new Buffer(key + ":xxx").toString("base64");

  var options = {
    method: 'GET',
    url: 'http://' + company + '.teamwork.com/projects.json',
    headers: {
      'cache-control': 'no-cache',
      'content-type': 'application/json',
      authorization: 'BASIC ' + base64
    }
  };

  return rp(options)
    .then(response => {
      const projects = JSON.parse(response).projects
        .map(({ id, name, description, logo, company }) => ({
          id: id,
          name: name,
          description: description,
          logo: logo,
          companyName: company.name
        }));
      return projects;
    })
    .catch(function(err) {
      throw new Error(err);
    });
}

/* GET projects listing. */
router.get('/', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  projects().then(function(data) {
    res.send(data);
  });

});

module.exports = router;
