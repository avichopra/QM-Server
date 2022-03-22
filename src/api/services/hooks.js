import userHooks from './user/user.hooks';
import ambulanceHooks from './ambulance/ambulance.hook';
import assignambulanceHooks from './assign.ambulance/assign.ambulance.hooks';

module.exports = {
  ...userHooks,
  ...ambulanceHooks,
  ...assignambulanceHooks
};
