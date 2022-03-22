const mongoose = require('mongoose');
const fieldsDefinitions = {
requestId:{type:mongoose.Schema.Types.ObjectId,unique:true},
userId:{type:mongoose.Schema.Types.ObjectId},
createdAt: { type: Date, default: Date.now() }
}
module.exports = fieldsDefinitions;