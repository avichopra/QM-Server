const mongoose = require('mongoose');

const fieldsDefinitions = {
	ambulanceId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Ambulance',
		unique: true
	},
	driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
	status: { type: Boolean, default: true },
	deleted: { type: Boolean, default: false }
};
module.exports = fieldsDefinitions;
