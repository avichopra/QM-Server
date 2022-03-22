import mongooseModel from '../../configure/mongoose.model';
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../../utils/APIError');
const RefreshToken = require('./refreshToken.model');
const moment = require('moment-timezone');
const { jwtExpirationInterval } = require('../../../config/vars');
const crypto = require('crypto');
const { host, port } = require('../../../config/vars');
import resetPasswordTemp from '../../../templates/resetPassword';
import { sendEmail } from '../../utils';
/**
 * Returns a formated object with tokens
 * @private
 */
export function generateTokenResponse(user, accessToken) {
  const tokenType = 'Bearer';
  const refreshToken = RefreshToken.generate(user).token;
  const expiresIn = moment().add(jwtExpirationInterval, 'minutes');
  console.log('expires time >>>>>>>>>>>>>');
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn
  };
}
exports.resetPassword = async userData => {
  console.log('Reset Passwpord', userData);
  const { email, resetPasswordToken, password } = userData;
  const User = mongooseModel.getCollection('User');
  let user = await User.get({
    filter: { email, resetPasswordToken: resetPasswordToken }
  });
  user = user && user.length && user[0];
  if (!user) {
    throw new APIError({
      message: 'No account with that email address exists.',
      status: httpStatus.BAD_REQUEST
    });
  }
  user.password = password;
  user.resetPasswordToken = null;
  const _temp = await new User(user).save();
  return { done: true };
};
/**
 * Returns jwt token if registration was successful
 * @public
 */
exports.forgetPassword = async ({ email, role }) =>
  new Promise(async (resolve, reject) => {
    console.log('Inside foregtPassword', email);
    crypto.randomBytes(20, async (err, buf) => {
      const token = buf.toString('hex');
      if (err) {
        reject(err);
      }
      const User = mongooseModel.getCollection('User');
      let user = await User.get({ filter: { email } });
      console.log('user details in forget password', user);
      user = user && user.length && user[0];
      if (!user) {
        return reject(
          new APIError({
            message: 'No account with that email address exists.',
            status: httpStatus.BAD_REQUEST
          })
        );
      }
      if (user.role != role) {
        return reject(
          new APIError({
            message: 'Unauthorised Call',
            status: httpStatus.UNAUTHORIZED
          })
        );
      }
      const setter = {};
      setter.resetPasswordToken = token;
      setter.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      const _temp = await User.update({ _id: user._id }, { ...setter });
      let link = `${host}/v1/auth/reset?email=${email}&verificationCode=${user.emailVerificationCode}`;
      const mailOptions = {
        to: user.email,
        subject: 'Password Reset',
        body: resetPasswordTemp(user.fullname, link, user.email)
      };
      console.log(mailOptions);
      const response = await sendEmail(mailOptions);
      resolve({ done: true });
    });
  });

exports.register = async userData => {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>user Data for Registration', userData);
  const User = mongooseModel.getCollection('User');
  try {
    const user = await new User(userData).save();
    const userTransformed = user.transform();
    const token = generateTokenResponse(user, user.token());
    console.log('user transformed>>>>>>>>>>>>>>>>>>>>', userTransformed);
    const Patient = mongooseModel.getCollection('Patient');
    await Patient.findOneAndUpdate(
      { userId: userTransformed.id },
      {
        $set: {
          bloodGroup: userData.bloodGroup,
          gender: userData.gender
        }
      },
      { new: true, upsert: true }
    );
    return { token, user: userTransformed };
  } catch (error) {
    console.log('duplicate');
    throw User.checkDuplicateEmail(error);
  }
};
exports.verified = async userData => {
  const { verificationCode, email } = userData;
  console.log('Inside Verified', userData);
  const User = mongooseModel.getCollection('User');
  try {
    // const { user, accessToken } = await User.findAndGet(userData);
    var otp = Math.floor(100000 + Math.random() * 900000);
    const user = await User.findOneAndUpdate(
      { email: email, emailVerificationCode: verificationCode },
      {
        $set: {
          emailVerified: true,
          otp: otp,
          emailVerificationCode: mongoose.Types.ObjectId()
        }
      },
      { new: true }
    );
    const err = {
      status: httpStatus.BAD_REQUEST,
      isPublic: true
    };
    if (!user) {
      err.message = 'Invalid URL/Link expired';
      throw new APIError(err);
    }

    return { user };
  } catch (error) {
    throw error;
  }
};
exports.resetLink = async userData => {
  const { verificationCode, email } = userData;
  console.log('Inside Reset', userData);
  const User = mongooseModel.getCollection('User');
  try {
    // const { Userupdated, accessToken } = await User.findsget(userData);
    const user = await User.findOne({ email: email });
    console.log('after finding', user);
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true
    };
    if (verificationCode === user.emailVerificationCode) {
      const Userupdated = await User.findOneAndUpdate(
        { email: email },
        { $set: { emailVerificationCode: mongoose.Types.ObjectId() } },
        { new: true }
      );
      console.log('After updatation', Userupdated);
      return { Userupdated };
    } else {
      err.message = 'Link Expired';
      throw new APIError(err);
    }
    // console.log('Details in service', Userupdated, accessToken);
    // const token = generateTokenResponse(Userupdated, accessToken);
    // const userTransformed = Userupdated.transform();
    // return { token, Userupdated: userTransformed };
  } catch (error) {
    throw error;
  }
};
/**
 * Returns jwt token if valid username and password is provided
 * @public
 */
exports.updateDriverLocation = async userData => {
  try {
    console.log('user Data', userData);
    const User = mongooseModel.getCollection('User');
    const Userupdated = await User.findOneAndUpdate(
      { deviceId: userData.deviceId },
      { $set: { location: [parseFloat(userData.latitude), parseFloat(userData.longitude)] } }
    );
    return { user: Userupdated };
  } catch (error) {
    throw error;
  }
};
exports.login = async userData => {
  try {
    console.log('UserData', userData);
    const User = mongooseModel.getCollection('User');
    const { user, accessToken } = await User.findAndGenerateToken(userData);
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    updateOnlineStatus({ email: user.email, status: true });
    return { token, user: userTransformed };
  } catch (error) {
    console.log('error-----> ', error);
    throw error;
  }
};
export async function updateOnlineStatus(userData) {
  const User = mongooseModel.getCollection('User');
  const Userupdated = await User.findOneAndUpdate(
    { email: userData.email },
    { $set: { online: userData.status } },
    { new: true }
  );
  return { Userupdated };
}
/**
 * Returns login use if token is valid
 * @public
 */
exports.getLoginUser = async userData => {
  try {
    const User = mongooseModel.getCollection('User');
    const user = await new User(userData);
    const userTransformed = user.transform();
    return { userTransformed };
  } catch (error) {
    throw error;
  }
};

/**
 * login with an existing user or creates a new one if valid accessToken token
 * Returns jwt token
 * @public
 */
exports.oAuth = async user => {
  try {
    const accessToken = user.token();
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return { token, user: userTransformed };
  } catch (error) {
    throw error;
  }
};

/**
 * Returns a new jwt when given a valid refresh token
 * @public
 */
exports.refresh = async ({ email, refreshToken }) => {
  try {
    const User = mongooseModel.getCollection('User');
    const refreshObject = await RefreshToken.findOneAndRemove({
      userEmail: email,
      token: refreshToken
    });
    console.log('Refresh object', refreshObject);
    const { user, accessToken } = await User.findAndGenerateToken({
      email,
      refreshObject
    });
    return generateTokenResponse(user, accessToken);
  } catch (error) {
    throw error;
  }
};
exports.changePassword = async ({ loginUser, password, newPassword }) => {
  console.log('from   change password>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', password, newPassword);

  const User = mongooseModel.getCollection('User');
  const user = await User.findOne({ _id: loginUser._id }).exec();
  try {
    if (user && (await user.passwordMatches(password))) {
      user.password = newPassword;
      const _temp = await user.save();
      return { done: true };
    }
  } catch (error) {
    throw error;
  }
};
