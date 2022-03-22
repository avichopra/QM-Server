const path = require('path');
// import .env variables
require('dotenv-safe').load({
  path: path.join(__dirname, '../../.env.example')
  // sample: path.join(__dirname, "../../.env.example")
});

module.exports = {
  host: 'https://api.quickmedicservices.com', //139.162.5.142:3000
  adminHost: 'http://localhost:3005',
  accountSid: 'ACb5fd9664aaf316e28a00971a22eb3f13',
  authToken: '29f64705018e48f9776afcb84e865575',
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
  mongo: {
    uri: process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TESTS : process.env.MONGO_URI
  },
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  rateLimitTime: process.env.RATE_LIMIT_TIME,
  rateLimitRequest: process.env.RATE_LIMIT_REQUEST,
  socket: {
    host: 'localhost',
    port: '7900'
  },
  fileUpload: {
    type: 'db', // local or S3 or db
    buckets: {
      public: { permissions: { write: 'ANY', read: 'ANY' } }
      // app: {
      //   permissions: { write: ["SUPERADMIN"], read: ["SUPERADMIN", "CUSTOMER"] }
      // },
      // authBucket: {
      //   permissions: { write: ["CUSTOMER"], read: ["SUPERADMIN", "CUSTOMER"] }
      // }
    }
  }
};
