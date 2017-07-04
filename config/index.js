var convict = require('convict');
 
// Define a schema 
var config = convict({
  env: {
    doc: "The applicaton environment.",
    format: ["production", "development", "test"],
    default: "development",
    env: "NODE_ENV"
  },
  ip: {
    doc: "The IP address to bind.",
    format: "ipaddress",
    default: "127.0.0.1",
    env: "IP_ADDRESS",
  },
  port: {
    doc: "The port to bind.",
    format: "port",
    default: 8080,
    env: "PORT"
  },
  database: {
    host: {
      doc: "Database host name/IP",
      format: '*',
      default: 'server1.dev.test'
    },
    name: {
      doc: "Database name",
      format: String,
      default: 'users'
    }
  },
  teamwork: {
    company: {
      doc: "Compmany name in the URL",
      format: String,
      default: ''
    },
    apikey: {
      doc: "API key for temwork",
      format: String,
      default: ''
    }
  },
  twFacade: {
    apiPath: {
      doc: "API URL for temwork facade API",
      format: '*',
      default: 'http://localhost:8080/'
    }
  },
  redis: {
    doc: 'The redis connection string.',
    format: '*',
    default: 'redis://localhost:6379',
    env: 'REDIS'
  },
  username: '',
  password: ''
});
 
// Load environment dependent configuration 
var env = config.get('env');
config.loadFile('./config/' + env + '.json');
 
// Perform validation 
config.validate({allowed: 'strict'});
 
module.exports = config;