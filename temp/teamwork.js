var request = require('request');
var config = require('./config');

var company = config.get('teamwork.company');
var key = config.get('teamwork.apikey');

var base64 = new Buffer(key + ":xxx").toString("base64");

var options = { 
  method: 'GET',
  url: 'http://'+ company +'.teamwork.com/projects.json',
  headers: 
   {    
    'cache-control': 'no-cache',
    'content-type': 'application/json',
    authorization: 'BASIC ' + base64
   }
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
