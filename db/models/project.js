'use strict';

const mongoose = require('mongoose');
const mongooseToCsv = require('mongoose-to-csv');

const projectSchema = mongoose.Schema({

  id: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: false,
    index: true
  },
  logo: {
    type: String,
    required: false,
    index: true
  }, 
  companyName: {
    type: String,
    required: false,
    index: true
  },  
  createdAt: {
    type: Date,
    default: new Date()
  },
  updatedAt: {
    type: Date,
    default: new Date()
  },  
  _errors: [{
    createdAt: {
      type: Date,
      default: new Date()
    },
    error: String
  }]
});

projectSchema.plugin(mongooseToCsv, {
  headers: 'ID Name Description Logo Company',
  constraints: {
    'ID': 'id',
    'Name': 'name',
    'Description': 'description',
    'Logo': 'logo',
    'Company': 'companyName'
  }  
});

// on every save, add the date
projectSchema.pre('save', (next) => {
  const currentDate = new Date();
  this.updatedAt = currentDate;
  if (!this.createdAt) this.createdAt = currentDate;
  next();
});

module.exports = mongoose.model('project', projectSchema);
