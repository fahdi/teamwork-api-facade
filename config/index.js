const convict = require('convict');
const path = require('path');

// Define a schema 
const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  ip: {
    doc: 'The IP address to bind.',
    format: 'ipaddress',
    default: '127.0.0.1',
    env: 'IP_ADDRESS'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 8080,
    env: 'PORT'
  },
  database: {
    host: {
      doc: 'Database host name/IP',
      format: '*',
      default: 'localhost:27017'
    },
    name: {
      doc: 'Database name',
      format: String,
      default: 'teamworkdata'
    },
    options: {
      reconnectTries:
        {
          doc: 'Times it should try to reconnect to mongo/ mongoose',
          format: Number,
          default: Number.MAX_VALUE
        },
      reconnectInterval: {
        doc: 'The interval in ms',
        format: '*',
        default: 1000
      },
      autoReconnect: true,
      useMongoClient: {
        doc: 'Should use mongo client?',
        format: Boolean,
        default: true
      },
      loggerLevel: 'error'
    }
  },
  teamwork: {
    team: {
      doc: 'Company name in the URL',
      format: String,
      default: ''
    },
    apiKey: {
      doc: 'API key for teamwork',
      format: String,
      default: ''
    }
  },
  facadeApi: {
    url: {
      doc: 'API URL for teamwork facade API',
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
  gcp: {
    projectId: {
      doc: 'Project ID from Google cloud.',
      format: String,
      default: 'teamwork-173902'
    },
    keyFilename: {
      doc: 'Key file path. README and get it from Google',
      format: '*',
      default: path.join(__dirname, '/teamwork-4dfe70ab5a4a.json')
    }
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

config.loadFile(path.join(__dirname, `${config.get('env')}.json`));

// Perform validation 
config.validate({ allowed: 'strict' });

module.exports = config;
