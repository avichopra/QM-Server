const httpStatus = require('http-status');
const service = require('./auth.service');
var twilio = require('twilio');
var MobileDetect = require('mobile-detect');
import { sendEmail } from '../../utils';
import userVerification from '../../../templates/userVerification';
const APIError = require('../../utils/APIError');
const {
  host,
  accountSid,
  authToken,
  adminHost
} = require('../../../config/vars');
var client = new twilio(accountSid, authToken);
export const sendVerificationEmail = async (user, req) =>
  new Promise(async (resolve, reject) => {
    console.log('inside send email', user);
    try {
      const link = `${host}/v1/auth/verify?email=${
        user.email
      }&verificationCode=${user.emailVerificationCode}`;
      const mailOptions = {
        to: user.email,
        subject: 'Please confirm your Email account',
        body: userVerification(user.fullname, link, user.email)
      };
      console.log(mailOptions);
      const response = await sendEmail(mailOptions);

      return resolve(response);
    } catch (error) {
      return reject(error);
    }
  });

/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.updateDriverLocation=async(req,res,next)=>{
  try
  {
    console.log("Data Received",req.body)
    const response=await service.updateDriverLocation(req.body);
    return res.json(response)
  }
  catch(error)
  {
    return next(error)
  }
}
export function sendOTP(to, otp) {
  console.log("user phone no.",to)
  client.messages
    .create({
      body: `Your Quick Medic signup verification OTP is ${otp}`,
      to: `+91${to}`, // Text this number
      from: '+12545875651' // From a valid Twilio number
    })
    .then(message => console.log('OTP Sent'))
    .catch(error => {
      console.log('Error in Twilo', error);
    });
}
exports.resetPassword = async (req, res, next) => {
  try {
    console.log('inside resetPassword controller', req.body);
    const response = await service.resetPassword(req.body);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};
exports.register = async (req, res, next) => {
  try {
    const response = await service.register(req.body);
    const emailResponse = await sendVerificationEmail(response.user, req);
    return res.status(httpStatus.CREATED).json(response);
  } catch (error) {
    return next(error);
  }
};
exports.forgetPassword = async (req, res, next) => {
  try {
    const response = await service.forgetPassword(req.body);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};
/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.verify = async (req, res, next) => {
  try {
    console.log('inside verify', req.query);
    if (
      req.query.email === undefined &&
      req.query.verificationCode === undefined
    ) {
      const apiError = new APIError({
        message: 'Bad Request',
        status: httpStatus.BAD_REQUEST
      });

      throw apiError;
    }
    // console.log('Reqested query', req.query.id);

    const response = await service.verified({
      email: req.query.email,
      verificationCode: req.query.verificationCode
    });
    // var otp = Math.floor(100000 + Math.random() * 900000);
    console.log('Details ', response);
    // sendOtp(to,body)

    sendOTP(response.user.contactNo, response.user.otp);
    console.log('Response in controller', response.user.contactNo);
    let detect = new MobileDetect(req.headers['user-agent']);
    switch (detect.os()) {
      case 'AndroidOS':
        res.redirect(`quickmedic://otp/${response.user.email}`);
        break;
      case 'IOS':
        res.redirect(`quickmedic://otp/${response.user._id}`);
        break;
      default:
        return res.send('Open link in phone browser');
    }
    // console.log('Requsting ', detect.os());
    // return res.status(httpStatus.CREATED).json(req.query);
  } catch (error) {
    console.log(error);
    return next(error);
  }
};
/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
exports.reset = async (req, res, next) => {
  try {
    console.log('Called reset route', req.query);
    if (
      req.query.email === undefined &&
      req.query.verificationCode === undefined
    ) {
      const apiError = new APIError({
        message: 'Bad Request',
        status: httpStatus.BAD_REQUEST
      });
      throw apiError;
    }
    const response = await service.resetLink({
      email: req.query.email,
      verificationCode: req.query.verificationCode
    });
    console.log('Response in controller', response.Userupdated);
    let detect = new MobileDetect(req.headers['user-agent']);
    switch (detect.os()) {
      case 'AndroidOS':
        {
          if (response.Userupdated.role === 'Patient') {
            res.redirect(
              `quickmedic://reset/${response.Userupdated.email}/${
                response.Userupdated.resetPasswordToken
              }`
            );
          } else
            res.redirect(
              `quickmedicdriver://reset/${response.Userupdated.email}/${
                response.Userupdated.resetPasswordToken
              }`
            );
        }

        break;
      default:
        return response.Userupdated.role === 'Admin'
          ? res.redirect(
              `${adminHost}/#/resetPassword/${encodeURI(
                JSON.stringify({
                  email: response.Userupdated.email,
                  resetPasswordToken: response.Userupdated.resetPasswordToken
                })
              )}`
            )
          : res.send('Please open link in mobile.');
    }
  } catch (error) {
    return next(error);
  }
};
/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
exports.login = async (req, res, next) => {
  try {
    const response = await service.login(req.body);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns return the login user if token is valid
 * @public
 */
exports.isLogin = async (req, res, next) => {
  try {
    const response = await service.getLoginUser(req.user);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};

/**
 * login with an existing user or creates a new one if valid accessToken token
 * Returns jwt token
 * @public
 */
exports.oAuth = async (req, res, next) => {
  try {
    const { user } = req;
    const response = await service.oAuth(user);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async (req, res, next) => {
  try {
    const response = await service.refresh(req.body);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};
/**
 * change password
 * @public
 */
exports.changePassword = async (req, res, next) => {
  try {
    const response = await service.changePassword({
      loginUser: req.user,
      ...req.body,
      ...req.params
    });
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};
