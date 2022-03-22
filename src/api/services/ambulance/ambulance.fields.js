const mongoose = require('mongoose');

const fieldsDefinitions = {
  // driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  vehicleSupportType: { type: String, default: 'Basic' },
  hospitalType: { type: String, default: 'Private' },
  vehicleName: { type: String },
  vehicleNo: { type: String },
  vehicleModel: {
    type: String
  },
  year: { type: Number },
  licensePlate: {
    type: String
  },
  status: {
    type: Boolean,
    default: true
  },
  hospitalName: { type: String },
  hospitalAddress: { type: String },
  hospitalLocation: { lat: String, long: String },
  Location: { type: Array, index: '2dsphere' },
  deleted: {
    type: Boolean,
    default: false
  },
  hospitalNo: {
    type: Number
  },
  deviceId: { type: String },
  createdAt: { type: Date }
};

module.exports = fieldsDefinitions;
