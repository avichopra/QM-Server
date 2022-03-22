const mongoose = require('mongoose');

const ROLES = require('../../../config/roles');
/**
 * User Roles
 */
const roles = Object.values(ROLES);

const fieldsDefinitions = {
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 128
  },
  username: {
    type: String,
    maxlength: 128,
    trim: true
  },
  emergencycontactnumber: {
    type: String
  },
  role: {
    type: String,
    enum: roles
  },
  picture: {
    type: String,
    trim: true
  },
  contactNo: {
    type: String
  },
  newContactNo: {
    type: String
  },
  status: {
    type: String
  },
  fullname: {
    type: String
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationCode: {
    type: String,
    default: mongoose.Types.ObjectId()
  },
  otp: {
    type: String
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: {
    type: String
  },
  booked: { type: Boolean, default: false },
  online: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: true
  },
  deleted: {
    type: Boolean,
    default: false
  },
  location: {
    type: Array,
    index: '2dsphere'
  },
  deviceId: { type: String },
  createdAt: { type: Date, default: new Date() },
  vehicleSupportType: { type: String }
};
module.exports = fieldsDefinitions;
