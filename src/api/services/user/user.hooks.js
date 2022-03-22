const bcrypt = require("bcryptjs");
const { env } = require("../../../config/vars");
import mongooseModel from "../../configure/mongoose.model";
import ROLES from "../../../config/roles";

module.exports = {
  User: {
    pre: {
      async save(next) {
        try {
          this.wasNew = this.isNew;
          if (!this.isModified("password")) return next();

          const rounds = env === "test" ? 1 : 10;

          const hash = await bcrypt.hash(this.password, rounds);
          this.password = hash;

          return next();
        } catch (error) {
          return next(error);
        }
      }
    },
    post: {
      async save(doc, next) {
        try {
          console.log("post hook.............", this);
          const role = doc.role;
          if (this.wasNew) {
            if (role === ROLES.PATIENT) {
              const Patient = mongooseModel.getCollection("Patient");
              const patient = await new Patient({
                userId: doc._id,
                _id: doc._id
              }).save();
            } else if (role === ROLES.DRIVER) {
              const Driver = mongooseModel.getCollection("Driver");
              const driver = await new Driver({
                userId: doc._id,
                _id: doc._id
              }).save();
            } else if (role === ROLES.ADMIN) {
              const Admin = mongooseModel.getCollection("Admin");
              const admin = await new Admin({
                userId: doc._id,
                _id: doc._id
              }).save();
            }
          }
          return next();
        } catch (error) {
          return next(error);
        }
      }
    }
  }
};
