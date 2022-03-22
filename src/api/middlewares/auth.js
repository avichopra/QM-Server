import { accessControl } from "../configure/accessControl";

const httpStatus = require("http-status");
const passport = require("passport");
const APIError = require("../utils/APIError");

const ADMIN = "admin";
const LOGGED_USER = "_loggedUser";
const Promise = require("bluebird");

const handleAPIStoreAuth = (req, res, next, roles) => async (
  err,
  user,
  info
) => {
  const error = err || info;
  const logIn = Promise.promisify(req.logIn);
  const apiError = new APIError({
    message: error ? error.message : "Unauthorized",
    status: httpStatus.UNAUTHORIZED,
    stack: error ? error.stack : undefined
  });
  try {
    if (error || !user) throw error;
    await logIn(user, { session: false });
  } catch (e) {
    return next(apiError);
  }
  if (roles) {
    let isValidRole = false;
    if (Array.isArray(roles)) {
      for (let index = 0; index < roles.length; index++) {
        const role = roles[index];
        if (user.role === role) {
          isValidRole = true;
          break;
        }
      }
    } else if (typeof roles === "string") {
      if (user.role === roles) {
        isValidRole = true;
      }
    }
    if (!isValidRole) {
      apiError.status = httpStatus.FORBIDDEN;
      apiError.message = "Forbidden";
      return next(apiError);
    } else if (err || !user) {
      return next(apiError);
    }
  }

  req.user = user;
  req.roles = roles;

  return next();
};

const handleJWT = (req, res, next, accessType) => async (err, user, info) => {
  console.log("user----1212--->", user);
  const error = err || info;
  const logIn = Promise.promisify(req.logIn);
  console.log("user------->", user);
  const apiError = new APIError({
    message: error ? error.message : "Unauthorized",
    status: httpStatus.UNAUTHORIZED,
    stack: error ? error.stack : undefined
  });
  console.log("user------->", user);
  try {
    if (error || !user) throw error;
    await logIn(user, { session: false });
  } catch (e) {
    return next(apiError);
  }
  const access = accessControl.verify({
    user,
    accessType,
    table: req.params.collection
  });
  console.log("access", access);
  if (accessType && !access.allowed) {
    apiError.status = httpStatus.FORBIDDEN;
    apiError.message = "Forbidden";
    return next(apiError);
  } else if (err || !user) {
    return next(apiError);
  }

  req.user = user;
  req.access = access;

  return next();
};

exports.ADMIN = ADMIN;
exports.LOGGED_USER = LOGGED_USER;

exports.authorize = accessType => (req, res, next) => {
  console.log("<-----1111------------------->", accessType);
  return passport.authenticate(
    "jwt",
    { session: false },
    handleJWT(req, res, next, accessType)
  )(req, res, next);
};
exports.authWrapper = roles => (req, res, next) => {
  passport.authenticate(
    "jwt",
    { session: false },
    handleAPIStoreAuth(req, res, next, roles)
  )(req, res, next);
};

exports.accessControl = accessRequired => (req, res, next) => {
  const { user } = req;
};

exports.oAuth = service => passport.authenticate(service, { session: false });
