const mongoose = require('mongoose');

const fieldsDefinitions = {
  bloodBankName: { type: String },
  bloodBankNo: { type: Number },
  bloodBankAddress: { type: String },
  bloodBankLocation: { type: Array, index: '2dsphere' },
  status: {
    type: Boolean,
    default: true
  },
  deleted: {
    type: Boolean,
    default: false
  },
  createdAt: { type: Date, default: new Date() }
};

module.exports = fieldsDefinitions;
