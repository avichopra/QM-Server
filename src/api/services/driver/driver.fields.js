const mongoose = require('mongoose');

const fieldsDefinitions = {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverUniqueNo: {
    type: String
  },
  deleted: {
    type: Boolean,
    default: false
  },
  createdAt: { type: Date, default: new Date() }
};

module.exports = fieldsDefinitions;
