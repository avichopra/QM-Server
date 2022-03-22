const Utility = require('./src/Utility');
const Socket = require('./src/socket');

module.exports = {
  getRequestParams: Utility.getRequestParams,
  configure: Socket.configure,
  emitGroupUpdates: Socket.emitGroupUpdates,
};
