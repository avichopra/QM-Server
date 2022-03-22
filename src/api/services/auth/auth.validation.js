const Joi = require('joi');

module.exports = {
  // POST /v1/auth/register
  register: {
    body: {
      fullname: Joi.string().required(),
      email: Joi.string()
        .email()
        .required(),
      contactNo: Joi.string()
        .required()
        .max(10),
      emergencycontactnumber: Joi.string()
        .required()
        .max(10),
      password: Joi.string()
        .required()
        .min(6)
        .max(128),
      role: Joi.string().required(),
      gender: Joi.string().required(),
      bloodGroup: Joi.string().required()
    }
  },

  // POST /v1/auth/login
  login: {
    body: {
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .required()
        .max(128),
      role: Joi.string().required()
    }
  },
  verify: {
    body: {
      id: Joi.string().required()
    }
  },
  // POST /v1/auth/facebook
  // POST /v1/auth/google
  oAuth: {
    body: {
      access_token: Joi.string().required()
    }
  },

  // POST /v1/auth/refresh
  refresh: {
    body: {
      email: Joi.string()
        .email()
        .required(),
      refreshToken: Joi.string().required()
    }
  }
};
