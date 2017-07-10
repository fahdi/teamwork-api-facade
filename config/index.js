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
      default: 'localhost:27017'
    },
    name: {
      doc: "Database name",
      format: String,
      default: 'teamworkdata'
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
  facadeApi: {
    url: {      
        doc: 'API URL for temwork facade API',
        format: '*',
        default: 'http://localhost:8080/'
      },
    paths: {      
        projects: {
          doc: 'Projects',
          format: String,
          default: 'projects'
        },
        timeEntries: {
          doc: 'Time entries',
          format: String,
          default: 'time-entries'
        }
      }    
  },
  redis: {
    doc: 'The redis connection string.',
    format: '*',
    default: 'redis://localhost:6379',
    env: 'REDIS'
  },
  jobAttempts: {    
    doc: 'The task maximum attempt count',
    format: 'nat',
    default: 5
  },
  jobBackoff: {

    delay: {
      doc: 'The task backoff delay',
      format: 'nat',
      default: 5 * 60 * 1000
    },
    type: {
      doc: 'The task backoff type',
      format: String,
      default: 'fixed'
    } 
  },
  jobTTLTimeout: {
    doc: 'The max task TTL (i.e., expiry time value to live in an active state) timeout in ms',
    format: 'nat',
    default: 15 * 60 * 1000
  },
  jobTimeout: {
    doc: 'The task timeout in ms',
    format: 'nat',
    default: 300000
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