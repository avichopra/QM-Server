import { each } from 'lodash';
import { notifyGroupsOnSocket } from '../utils/sockets';
import mongooseModel from '../configure/mongoose.model';
import { sendOTP } from '../services/auth/auth.controller';
import { sendVerificationEmail } from '../services/auth/auth.controller';
const Joi = require('joi');
import { generateTokenResponse, updateOnlineStatus } from '../services/auth/auth.service';
const APIError = require('../utils/APIError');
const httpStatus = require('http-status');
import utils from '../utils';
const mongoose = require('mongoose');
import { toNumber } from 'lodash';
module.exports = {
  /**
   * @api {all} v1/dispatch/testing Dispatch Example
   * @apiDescription this is example dispatch api for developers at server side
   * @apiVersion 1.0.0
   * @apiName Testing
   * @apiGroup Dispatch
   * @apiPermission public or private or role based
   *
   * @apiHeader {String} Authorization  User's access token required for public or role based api
   *
   * @apiParam  {String}              Email     Email of the tester
   * @apiParam  {String}              name      Name of the tester
   * @apiParam  {String}              role      Role of the tester
   *
   * @apiSuccess (Done 200) {Object}  response    response object
   *
   * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
   * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users
   * @apiError (Forbidden 403)     Forbidden        You are not allowed to access this API
   */
  testing: {
    public: true,
    // roles: ["SUPERADMIN"],
    // joi: {
    //   email: Joi.string()
    //     .email()
    //     .required(),
    //   name: Joi.string().max(128),
    //   role: Joi.string().valid(['CUSTOMER', 'ADMIN', 'SUPERADMIN'])
    // },
    dispatch: async ({ params, user, getModel, dispatch }) => {
      console.log('params--->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', params, user);
      let RequestHandler = mongooseModel.getCollection('RequestHandler');
      await new RequestHandler({
        requestId: '5c7e1397bca9f417311b3d76',
        userId: '5c7e1012bca9f417311b3d6a'
      }).save();
      const Users = await getModel('User').get({
        filter: { email: params.email }
      });
      // utils.notifyGroupsOnSocket('groupId', { users: Users });
      return { users: Users };
    }
  },

  otpVerification: {
    public: true,
    Joi: {
      email: Joi.string()
        .email()
        .required(),
      otp: Joi.string().required()
    },
    dispatch: async ({ params, user, getModel, dispatch }) => {
      const User1 = await getModel('User').get({
        filter: { email: params.email }
      });
      const newContact = User1[0].newContactNo;
      if (User1[0].otp === params.otp) {
        if (User1[0].role === 'Driver') {
          console.log('Params', params);
          let User = mongooseModel.getCollection('User');
          let updatedUser, Userupdated;
          // if (params.contactNo !== undefined) {
          updatedUser = await User.findOneAndUpdate(
            { email: params.email },
            {
              $set: params.contactNo
                ? { phoneVerified: true, contactNo: params.contactNo }
                : User1[0].newContactNo
                ? { phoneVerified: true, contactNo: User1[0].newContactNo }
                : { phoneVerified: true }
            },
            { new: true }
          );
          if (params.contactNo === undefined)
            Userupdated = updateOnlineStatus({
              email: params.email,
              status: true
            });
          //  if(params.contactNo && User1[0].newContactNo)
          // } else {
          // 	updatedUser = await User.findOneAndUpdate(
          // 		{ email: params.email },
          // 		{ $set: { phoneVerified: true, contactNo: User[0].newContactNo } },
          // 		{ new: true }
          // 	);
          // }
          console.log('User details inside otpVerification', updatedUser);
          const token = generateTokenResponse(updatedUser, updatedUser.token());
          const userTransformed = updatedUser.transform();

          return { token, user: userTransformed };
        } else {
          let User = mongooseModel.getCollection('User');
          let updatedUser, Userupdated;
          if (params.contactNo !== undefined) {
            updatedUser = await User.findOneAndUpdate(
              { email: params.email },
              { $set: { phoneVerified: true, contactNo: params.contactNo } },
              { new: true }
            );
          } else {
            updatedUser = await User.findOneAndUpdate(
              { email: params.email },
              {
                $set: newContact ? { phoneVerified: true, contactNo: newContact } : { phoneVerified: true }
              },
              { new: true }
            );
            Userupdated = updateOnlineStatus({
              email: params.email,
              status: true
            });
          }
          console.log('User details inside otpVerification', updatedUser);
          const token = generateTokenResponse(updatedUser, updatedUser.token());
          const userTransformed = updatedUser.transform();
          return { token, user: userTransformed };
        }
      } else {
        const apiError = new APIError({
          message: 'Invalid OTP',
          status: httpStatus.BAD_REQUEST
        });
        throw apiError;
      }
    }
  },
  reSendOtp: {
    public: true,
    Joi: {
      email: Joi.string()
        .email()
        .required()
    },
    dispatch: async ({ params, user, getModel, dispatch }) => {
      let contactno;
      console.log('Params', params);
      var otp = Math.floor(100000 + Math.random() * 900000);
      let User = mongooseModel.getCollection('User');
      let updatedUser = await User.findOneAndUpdate({ email: params.email }, { $set: { otp: otp } }, { new: true });
      console.log('updated user', updatedUser);
      if (updatedUser.newContactNo && updatedUser.phoneVerified === false) {
        sendOTP(updatedUser.newContactNo, updatedUser.otp);
      } else sendOTP(updatedUser.contactNo, updatedUser.otp);
    }
  },
  resentVerificationEmail: {
    public: true,
    Joi: {
      email: Joi.string()
        .email()
        .required()
    },
    dispatch: async ({ params, user, getModel, dispatch }) => {
      console.log('Params', params);
      let User = mongooseModel.getCollection('User');
      let updatedUser = await User.findOneAndUpdate(
        { email: params.email },
        { $set: { emailVerificationCode: mongoose.Types.ObjectId() } },
        { new: true }
      );
      await sendVerificationEmail(updatedUser);
    }
  },
  ambulanceRequestAccepted: {
    public: false,
    dispatch: async ({ params, user, getModel, dispatch }) => {
      console.log('data when request accepted>>>>>', params);
      try {
        let request = await mongooseModel.getCollection('Requests').findOne({
          requestedBy: params.patient.RequestData.requestedBy,
          status: 'Pending'
        });
        console.log('request accepted>>>>>>>>>>>>>>>>>>>>>>>', request);
        if (request) {
          let RequestHandler = mongooseModel.getCollection('RequestHandler');
          await new RequestHandler({
            requestId: params.patient.RequestData.requestedBy,
            userId: params.driver.driverId
          }).save();
          let ambulaceLocation = await mongooseModel
            .getCollection('AssignAmbulance')
            .findOne({ status: true, driverId: params.driver.driverId })
            .populate('ambulanceId', 'hospitalName hospitalAddress hospitalLocation hospitalNo vehicleNo');
          console.log('ambulance location data', ambulaceLocation);
          let trip = {
            patientId: params.patient.patientId,
            driverId: params.driver.driverId,
            status: 'Progress',
            patientAddress: params.patient.patientLocation.currentPlace,
            driverAddress: params.driver.driverLocation.currentPlace,
            hospitalName: ambulaceLocation.ambulanceId.hospitalName,
            hospitalAddress: ambulaceLocation.ambulanceId.hospitalAddress,
            hospitalLocation: ambulaceLocation.ambulanceId.hospitalLocation,
            hospitalNo: ambulaceLocation.ambulanceId.hospitalNo,
            patientLocation: {
              lat: params.patient.patientLocation.latitude,
              long: params.patient.patientLocation.longitude
            },
            driverLocation: {
              lat: params.driver.driverLocation.latitude,
              long: params.driver.driverLocation.longitude
            },
            pickedPatient: false,
            vehicleNo: ambulaceLocation.ambulanceId.vehicleNo,
            deviceId: params.driver.deviceId
          };
          const Trips = mongooseModel.getCollection('Trips');
          let newTrip = await new Trips(trip).save();
          console.log('new trips', newTrip);
          let requestAm = mongooseModel.getCollection('Requests');
          let UpdatedData = await requestAm.findOneAndUpdate(
            { requestedBy: params.patient.patientId, status: 'Pending' },
            { $set: { status: 'Progress' } }
          );
          let tripData = await mongooseModel
            .getCollection('Trips')
            .findOne({ driverId: params.driver.driverId, status: 'Progress' })
            .populate({
              path: 'patientId',
              populate: {
                path: 'userId',
                select: 'fullname email emergencycontactnumber contactNo picture'
              }
            })
            .populate({
              path: 'driverId',
              populate: {
                path: 'userId',
                select:
                  'deleted role createdAt fullname email contactNo emailVerificationCode phoneVerified online deviceId picture'
              }
            });
          console.log('tripData>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', tripData);
          await mongooseModel
            .getCollection('User')
            .findOneAndUpdate({ _id: params.driver.driverId }, { $set: { booked: true } });
          notifyGroupsOnSocket(UpdatedData._id, {
            filter: 'ShowAcceptDecline',
            showAcceptDecline: params.showAcceptDecline
          });
          console.log('onAccept>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', params.patient.patientId);
          notifyGroupsOnSocket(params.patient.patientId, {
            filter: 'onAccept',
            trip: tripData
          });
          console.log('requestedBy data>>>>>>>>>>>>>>>>>>>.', params.patient.RequestData.requestedBy);
          await mongooseModel.getCollection('RequestHandler').findOneAndRemove({
            requestId: params.patient.RequestData.requestedBy
          });
          return { trip: tripData };
        } else {
          console.log('Request already accepted', params);
          notifyGroupsOnSocket(params.driver.driverId, {
            filter: 'ShowAcceptDecline',
            showAcceptDecline: params.showAcceptDecline
          });
        }
      } catch (error) {
        console.log('Error', error);
        notifyGroupsOnSocket(params.driver.driverId, {
          filter: 'ShowAcceptDecline',
          showAcceptDecline: params.showAcceptDecline
        });
      }
    }
  },
  cancelTrip: {
    public: false,
    dispatch: async ({ params, user, getModel, dispatch }) => {
      const Requests = await mongooseModel
        .getCollection('Requests')
        .findOneAndUpdate({ status: 'Pending', requestedBy: params.patientId }, { $set: { status: 'Cancelled' } });
      await mongooseModel.getCollection('User').findOneAndUpdate({ _id: params.driverId }, { $set: { booked: false } });
      notifyGroupsOnSocket(params.driverId, {
        filter: 'RemovePatient',
        deviceId: params.deviceId
      });
    }
  },
  cancelAllAmbulanceRequest: {
    public: false,
    dispatch: async ({ params, user, getModel, dispatch }) => {
      const err = {
        status: httpStatus.NOT_FOUND,
        isPublic: true
      };
      const Requests = await mongooseModel
        .getCollection('Requests')
        .findOneAndUpdate(
          { status: 'Pending', requestedBy: params.patientId },
          { $set: { status: 'Cancelled' } },
          { new: true }
        );
      console.log('Requests cancelled>>>>>>>>>>', Requests);
      notifyGroupsOnSocket(Requests._id, {
        filter: 'cancelAllDrivers'
      });
    }
  },
  pickedUpPatient: {
    public: false,
    dispatch: async ({ params, user, getModel, dispatch }) => {
      console.log('params after pickedup', params);
      let TripsData = await mongooseModel
        .getCollection('Trips')
        .findOneAndUpdate(
          { driverId: params.driverData.userId._id, status: 'Progress' },
          { $set: { pickedPatient: true } },
          { new: true }
        )
        .populate({
          path: 'patientId',
          populate: {
            path: 'userId',
            select: 'fullname email emergencycontactnumber contactNo picture'
          }
        })
        .populate({
          path: 'driverId',
          populate: {
            path: 'userId',
            select:
              'deleted role createdAt fullname email contactNo emailVerificationCode phoneVerified online deviceId picture'
          }
        });
      console.log('trip data', TripsData);
      notifyGroupsOnSocket(params.patientData.userId._id, {
        filter: 'pickedUpPatient',
        trip: TripsData
      });
      return { trip: TripsData };
    }
  },
  tripCompleted: {
    public: false,
    dispatch: async ({ params, user, getModel, dispatch }) => {
      console.log('tripCompleted Data>>>>>>>>>', params);
      const Trips = mongooseModel.getCollection('Trips');
      let TripsData = await Trips.findOneAndUpdate(
        {
          driverId: params.driverData,
          status: 'Progress',
          pickedPatient: true
        },
        { $set: { status: 'Complete' } },
        { new: true }
      );
      console.log('trip data', TripsData);
      let requestAm = mongooseModel.getCollection('Requests');
      let UpdatedData = await requestAm.findOneAndUpdate(
        { requestedBy: params.patientData, status: 'Progress' },
        { $set: { status: 'Complete' } }
      );
      await mongooseModel.getCollection('User').findOneAndUpdate(
        { _id: params.driverData, booked: true },
        {
          $set: {
            booked: false,
            location: [toNumber(params.updateLocation.latitude), toNumber(params.updateLocation.longitude)]
          }
        }
      );
      notifyGroupsOnSocket(params.patientData, {
        filter: 'MarkComplete',
        trip: TripsData
      });
    }
  },
  requestAmbulance: {
    public: false,
    Joi: {
      ambulanceSupport: Joi.string().required()
    },
    dispatch: async ({ params, user, getModel, dispatch }) => {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>requesting Ambulance', params);
      let patient = {
        userId: user._id,
        patientId: params.id,
        name: user.fullname,
        picture: user.picture,
        emergencyContactNo: user.emergencycontactnumber,
        contactNo: user.contactNo
      };
      console.log('Patients', patient);
      try {
        if (params.ambulanceSupport) {
          console.log('params', params);
          //
          const User = await getModel('User').get({
            filter: {
              role: 'Driver',
              vehicleSupportType: params.ambulanceSupport,
              online: true,
              booked: false,
              status: true,
              deleted: false,
              location: {
                $near: {
                  $geometry: {
                    type: 'Point',
                    coordinates: [params.location.latitude, params.location.longitude]
                  },
                  $minDistance: 0,
                  $maxDistance: 50000
                }
              }
            }
          });
          if (User.length === 0) {
            const err = {
              status: httpStatus.NOT_FOUND,
              isPublic: true
            };
            err.message = 'NO ANY DRIVER FOUND';
            throw new APIError(err);
          }
          console.log('NearBy users', User);
          let arr = [];
          User.map(user => {
            arr.push(user._id);
          });
          // User.map((user) => {
          const Requests = mongooseModel.getCollection('Requests');
          let newRequest = await new Requests({
            requestedBy: params.id,
            status: 'Pending',
            createdAt: Date.now(),
            victimName: params.victimData.victimName,
            age: params.victimData.age,
            mobileNo: params.victimData.mobileNo,
            gender: params.victimData.gender,
            victimType: params.victimData.victimType
          }).save();
          notifyGroupsOnSocket(arr, {
            filter: 'requestAmbulance',
            patient: { ...patient, RequestData: newRequest },
            location: params.location
            // allDrivers: arr
          });
          return { users: User, requestData: newRequest };
        } else if (params.trip) {
          const Trips = mongooseModel.getCollection('Trips');

          let newTrip = await new Trips(params.trip).save();
          console.log(
            'all drivers>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::',
            params.allDrivers.length === 0
          );
        }
      } catch (err) {
        console.log(' request ambulance error>>>>>>>>>', err);
        throw err;
      }
    }
  },
  updateDriver: {
    public: false,

    dispatch: async ({ params, user, getModel, dispatch }) => {
      const User = await getModel('User');
      if (params.phoneVerified === false) {
        let updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          {
            $set: {
              phoneVerified: params.phoneVerified,
              picture: params.picture,
              fullname: params.fullname,
              newContactNo: params.newContactNo
            }
          },
          { new: true }
        );

        return { updatedUser: updatedUser };
      } else {
        let updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $set: { picture: params.picture, fullname: params.fullname } },
          { new: true }
        );

        return { updatedUser: updatedUser };
      }
    }
  },
  updateOnlinestatus: {
    public: true,
    dispatch: async ({ params, user, getModel, dispatch }) => {
      console.log('In update Online status>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', params);
      let data = updateOnlineStatus({
        email: params.email,
        status: params.status
      });
      return { data: data };
    }
  },
  updatePatient: {
    public: false,
    dispatch: async ({ params, user, getModel, dispatch }) => {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>update Patients', params);
      const User = await getModel('User');
      let updatedUser;
      if (params.phoneVerified === false) {
        updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          {
            $set: {
              // contactNo: params.contactNo,ne
              newContactNo: params.newContactNo,
              phoneVerified: params.phoneVerified,
              picture: params.picture,
              fullname: params.fullname,
              emergencycontactnumber: params.emergencycontactnumber
            }
          },
          { new: true }
        );
      } else {
        updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          {
            $set: {
              // contactNo: params.contactNo,
              picture: params.picture,
              fullname: params.fullname,
              emergencycontactnumber: params.emergencycontactnumber
            }
          },
          { new: true }
        );
      }
      const Patient = await getModel('Patient');
      let updatedPatient = await Patient.findOneAndUpdate(
        { userId: user._id },
        {
          $set: {
            userId: user._id,
            address: params.address,
            bloodGroup: params.bloodGroup,
            realtionWithPatient: params.realtionWithPatient,
            emergencyContactNo: params.emergencyContactNo,
            gender: params.gender
          }
        },
        { new: true, upsert: true }
      );
      return { updatedUser: updatedUser, updatedPatient: updatedPatient };
    }
  },
  deleted: {
    public: false,
    dispatch: async ({ params, user, getModel, dispatch }) => {
      const User = await getModel('User');
      if (user.role === 'Admin');
      const getUser = await User.findOneAndUpdate({ _id: params._id }, { $set: { deleted: true } }, { new: true });
      const Collection = await getModel(`${getUser.role}`);
      await Collection.findOneAndUpdate(
        {
          userId: params._id
        },
        { $set: { deleted: true } },
        { new: true }
      );
      return {};
    }
  },
  driverAssign: {
    public: false,
    dispatch: async ({ params, user, getModel, dispatch }) => {
      const AssginAmbulance = await getModel('AssignAmbulance');
      const Ambulance = await getModel('Ambulance');
      const User = await getModel('User');
      if (user.role === 'Admin') {
        const ambulance = await Ambulance.findOne({ _id: params.ambulanceId });
        if (params.oldDriverId && params.driverId != params.oldDriverId) {
          await User.update(
            { _id: params.oldDriverId },
            {
              $unset: { deviceId: '', vehicleSupportType: '' },
              $set: { location: [] }
            }
          );
        }
        if (params.driverId) {
          await AssginAmbulance.update({ driverId: params.driverId }, { $unset: { driverId: '' } });
        }
        const assignDriver = await AssginAmbulance.findOneAndUpdate(
          { ambulanceId: params.ambulanceId },
          params.driverId ? { $set: { driverId: params.driverId } } : { $unset: { driverId: params.driverId } }
        );
        if (assignDriver) {
          await User.update(
            { _id: params.driverId },
            {
              $set: {
                deviceId: ambulance.deviceId,
                vehicleSupportType: ambulance.vehicleSupportType,
                location: [toNumber(ambulance.hospitalLocation.lat), toNumber(ambulance.hospitalLocation.long)]
              }
            }
          );
        }

        return assignDriver;
      }
    }
  },
  driverLocation: {
    public: false,
    dispatch: async ({ params, user, getModel, dispatch }) => {
      const User = await getModel('User');
      await User.update(
        { _id: params.driverId },
        {
          $set: {
            location: [toNumber(params.location.latitude), toNumber(params.location.longitude)]
          }
        }
      );
    }
  },
  assignBloodBank: {
    public: false,
    dispatch: async ({ params, user, getModel, dispatch }) => {
      const BloodBank = await mongooseModel.getCollection('BloodBank');
      let data = {
        bloodBankName: params.bloodBankName,
        bloodBankNo: params.bloodBankNo,
        bloodBankAddress: params.bloodBankAddress,
        bloodBankLocation: [toNumber(params.bloodBankLocation.lat), toNumber(params.bloodBankLocation.long)]
      };
      let afterSave = await new BloodBank(data).save();
      console.log('>>>>>params data for blood bank>>>', params, 'data after saving', afterSave);
      return afterSave;
    }
  },
  getBloodBank: {
    public: false,
    dispatch: async ({ params, user, getModel, dispatch }) => {
      console.log('Params>>>>>', params);
      let hospitalType, Ambulance;
      if (params.PriSelected === true) {
        hospitalType = 'Private';
      }
      if (params.govtSelected === true) {
        hospitalType = 'Govt';
      }
      if (!params.status) {
        let BloodBank = await getModel('BloodBank').get({
          filter: {
            status: true,
            deleted: false,
            bloodBankLocation: {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: [toNumber(params.location.lat), toNumber(params.location.long)]
                },
                $minDistance: 0,
                $maxDistance: 50000
              }
            }
          }
        });
        return BloodBank;
      } else {
        Ambulance = await getModel('Ambulance').get({
          filter: {
            status: true,
            deleted: false,
            hospitalType: hospitalType,
            Location: {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: [toNumber(params.location.lat), toNumber(params.location.long)]
                },
                $minDistance: 0,
                $maxDistance: 50000
              }
            }
          }
        });
        return Ambulance;
      }
    }
  }
};
