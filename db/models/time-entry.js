'use strict';

const mongoose = require('mongoose');

const timeEntrySchema = mongoose.Schema({

  id: {
    type: String,
    required: true,
    index: true
  },
  projectId: {
    type: String,
    required: true,
    index: true
  },
  isbillable: {
    type: Boolean,
    required: true,
    index: true
  },
  todoListLame: {
    type: String,
    required: true,
    index: true
  },
  todoItemName: {
    type: String,
    required: true,
    index: true
  },
  isbilled: {
    type: String,
    required: true,
    index: true
  },
  updatedDate: { // "2017-01-02T12:21:04Z"
    type: Date,
    required: true,
    index: true
  },
  todoListId: {
    type: String,
    required: true,
    index: true
  },
  tags: [],
  canEdit: {
    type: String,
    required: true,
    index: true
  },
  taskEstimatedTime: {
    type: String,
    required: true,
    index: true
  },
  companyName: {
    type: String,
    required: true,
    index: true
  },
  invoiceNo: {
    type: Number,
    required: true,
    index: true
  },
  personFirstName: {
    type: String,
    required: true,
    index: true
  },
  personLastName: {
    type: String,
    required: true,
    index: true
  },
  parentTaskName: {
    type: String,
    required: true,
    index: true
  },
  dateUserPerspective: { // "2017-01-02T15:38:00Z",
    type: String,
    required: true,
    index: true
  },
  minutes: {
    type: Number,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    index: true
  },
  ticketId: {
    type: String,
    required: true,
    index: true
  },
  taskIsPrivate: { // TO-DO: check if 0 or 1 or boolean, if so change
    type: Boolean,
    required: true,
    index: true
  },
  parentTaskId: {
    type: Number,
    required: true,
    index: true
  },
  companyId: {
    type: Number,
    required: true,
    index: true
  },
  projectStatus: {
    type: String,
    required: true,
    index: true
  },
  personId: {
    type: Number,
    required: true,
    index: true
  },
  projectName: {
    type: Number,
    required: true,
    index: true
  },
  taskTags: [],
  taskIsSubTask: { // TO-DO: check if 0 or 1 or boolean, if so change
    type: Boolean,
    required: true,
    index: true
  },
  todoItemId: {
    type: Number,
    required: true,
    index: true
  },
  date: { // "2017-01-02T12:21:04Z"
    type: Date,
    required: true,
    index: true
  },
  hours: {
    type: Number,
    required: true,
    index: true
  },
  hasStartTime: { // TO-DO: check if 0 or 1 or boolean, if so change
    type: Boolean,
    required: true,
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
