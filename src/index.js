import configure from './api/configure/configure';
import roles from './config/roles';
import grantList from './config/grantList';
import fields from './api/services/fields';
import hooks from './api/services/hooks';
import methods from './api/services/methods';
import actions from './api/actions';

const path = require('path');

global.appRoot = path.resolve(__dirname);
Promise = require('bluebird');
const { port, env } = require('./config/vars');
const app = require('./config/express');
const mongoose = require('./config/mongoose');

mongoose.connect();
configure({
  roles,
  grantList,
  fields,
  hooks,
  methods,
  actions,
});
app.listen(port, () => {
  console.info(`server started on port ${port} (${env})`);
});
/**
 * Exports express
 * @public
 */
module.exports = app;
