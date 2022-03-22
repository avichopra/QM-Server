const mongoose = require('mongoose');

const fieldsDefinitions = {
  requestedBy: { type: mongoose.Schema.Types.ObjectId },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId },
  createdAt: { type: Date, default: Date.now() },
  status: { type: String },
  victimName: { type: String },
  age: { type: String },
  mobileNo: { type: String },
  gender: { type: String },
  victimType: { type: String }
};
module.exports = fieldsDefinitions;
