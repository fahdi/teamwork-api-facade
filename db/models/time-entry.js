'use strict';

const mongoose = require('mongoose');

const timeEntrySchema = mongoose.Schema({

  id: {
    type: String,
    required: false,
    index: true
  },
  projectId: {
    type: String,
    required: false,
    index: true
  },
  isbillable: {
    type: Boolean,
    required: false,
    index: true
  },
  todoListLame: {
    type: String,
    required: false,
    index: true
  },
  todoItemName: {
    type: String,
    required: false,
    index: true
  },
  isbilled: {
    type: String,
    required: false,
    index: true
  },
  updatedDate: { // "2017-01-02T12:21:04Z"
    type: Date,
    required: false,
    index: true
  },
  todoListId: {
    type: String,
    required: false,
    index: true
  },
  tags: [],
  canEdit: {
    type: String,
    required: false,
    index: true
  },
  taskEstimatedTime: {
    type: String,
    required: false,
    index: true
  },
  companyName: {
    type: String,
    required: false,
    index: true
  },
  invoiceNo: {
    type: Number,
    required: false,
    index: true
  },
  personFirstName: {
    type: String,
    required: false,
    index: true
  },
  personLastName: {
    type: String,
    required: false,
    index: true
  },
  parentTaskName: {
    type: String,
    required: false,
    index: true
  },
  dateUserPerspective: { // "2017-01-02T15:38:00Z",
    type: String,
    required: false,
    index: true
  },
  minutes: {
    type: Number,
    required: false,
    index: true
  },
  description: {
    type: String,
    required: false,
    index: true
  },
  ticketId: {
    type: String,
    required: false,
    index: true
  },
  taskIsPrivate: { // TO-DO: check if 0 or 1 or boolean, if so change
    type: Boolean,
    required: false,
    index: true
  },
  parentTaskId: {
    type: Number,
    required: false,
    index: true
  },
  companyId: {
    type: Number,
    required: false,
    index: true
  },
  projectStatus: {
    type: String,
    required: false,
    index: true
  },
  personId: {
    type: Number,
    required: false,
    index: true
  },
  projectName: {
    type: String,
    required: false,
    index: true
  },
  taskTags: [],
  taskIsSubTask: { // TO-DO: check if 0 or 1 or boolean, if so change
    type: Boolean,
    required: false,
    index: true
  },
  todoItemId: {
    type: Number,
    required: false,
    index: true
  },
  date: { // "2017-01-02T12:21:04Z"
    type: Date,
    required: false,
    index: true
  },
  hours: {
    type: Number,
    required: false,
    index: true
  },
  hasStartTime: { // TO-DO: check if 0 or 1 or boolean, if so change
    type: Boolean,
    required: false,
    index: true
  },
  createdAt: { //"2017-01-02T12:20:24Z",
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

// on every save, add the date
timeEntrySchema.pre('save', (next) => {
  const currentDate = new Date();
  this.updatedAt = currentDate;
  if (!this.createdAt) this.createdAt = currentDate;
  next();
});

module.exports = mongoose.model('timeEntry', timeEntrySchema);
