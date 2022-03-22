import { each } from "lodash";
import { accessControl } from "./accessControl";
import mongooseModel from "./mongoose.model";
import API_STORE from "./api.store";

const configure = ({
  fields,
  grantList,
  roles,
  hooks = {},
  methods = {},
  actions = {}
}) => {
  accessControl.addGrantList(grantList);
  each(Object.keys(fields), collection => {
    mongooseModel.addCollection(
      collection,
      fields[collection],
      hooks[collection],
      methods[collection]
    );
    accessControl.addFields(fields[collection], collection);
  });
  each(Object.keys(actions), action => {
    API_STORE.setAction(actions[action], action);
  });
  accessControl.configureAccessControlList();
};

module.exports = configure;
