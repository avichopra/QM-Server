import mongooseModel from '../../configure/mongoose.model';

module.exports = {
  AssignAmbulance: {
    pre: {},
    post: {
      async update(doc, next) {
        try {
          if (this._update.$set && this._update.$set.deleted) {
            const AssignAmbulance = mongooseModel.getCollection(
              'AssignAmbulance'
            );
            const assignAmbulance = await AssignAmbulance.find(
              {
                _id: this._conditions._id
              },
              { ambulanceId: 1 }
            ).limit(1);

            const Ambulance = mongooseModel.getCollection('Ambulance');

            await Ambulance.update(
              { _id: assignAmbulance[0].ambulanceId },
              { $set: { deleted: true } }
            );
          }
        } catch (error) {
          console.log('error from post update hook of assign ambulance', error);
        }
      }
    }
  }
};
