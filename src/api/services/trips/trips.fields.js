const mongoose = require('mongoose');

const fieldsDefinitions = {
	patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
	driverId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Driver'
	},
	status: String, //Cancelled/Success
	cancellationMessage: String,
	cancelledBy: String,
	patientAddress: String,
	driverAddress: String,
	hospitalAddress: String,
	hospitalName:String,
	hospitalNo:String,
	patientLocation: { lat: String, long: String },
	driverLocation: { lat: String, long: String },
	hospitalLocation: { lat: String, long: String },
	pickedPatient:{type:Boolean,default:false},
	vehicleNo:String,
	deviceId:String,
	updatedAt:Date
};

module.exports = fieldsDefinitions;
