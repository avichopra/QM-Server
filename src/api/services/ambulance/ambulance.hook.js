import mongooseModel from '../../configure/mongoose.model';
import { toNumber } from 'lodash';
module.exports = {
  Ambulance: {
    pre: {
      async save(next) {
        try {
          this.wasNew = this.isNew;
          return next();
        } catch (error) {
          return next(error);
        }
      }
    },
    post: {
      async save(doc, next) {
        try {
          if (this.wasNew) {
            const AssignAmbulance = mongooseModel.getCollection('AssignAmbulance');
            await new AssignAmbulance({
              ambulanceId: doc._id
            }).save();
            const Ambulance = mongooseModel.getCollection('Ambulance');
            await Ambulance.findOneAndUpdate(
              { _id: doc._id },
              { $set: { Location: [toNumber(doc.hospitalLocation.lat), toNumber(doc.hospitalLocation.long)] } }
            );
            // console.log('doc>>>>>', doc);
          }
          return next();
        } catch (error) {
          return next(error);
        }
      },

      async update(next) {
        try {
          const AssignAmbulance = mongooseModel.getCollection('AssignAmbulance');
          const Ambulance = mongooseModel.getCollection('Ambulance');
          const ambulance = await Ambulance.findOne({
            _id: this._conditions._id
          });

          const driver = await AssignAmbulance.findOne({
            ambulanceId: this._conditions._id
          });
          const User = mongooseModel.getCollection('User');
          const updatedUser = await User.findOneAndUpdate(
            { _id: driver.driverId },
            {
              $set: {
                deviceId: ambulance.deviceId,
                vehicleSupportType: ambulance.vehicleSupportType,
                location: [toNumber(ambulance.hospitalLocation.lat), toNumber(ambulance.hospitalLocation.long)]
              }
            }
          );
        } catch (error) {
          console.log('error from post update hook of assign ambulance', error);
        }
      }
    }
  }
};
