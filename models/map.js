var mongoose = require(__base + '/libs/mongoose'),
	moment = require('moment');

var schema = mongoose.Schema({
	name: String,
	orders: [{
		number: String,
		address: String,
		time: String,
		comment: String,
		coordinates: [Number],
		index: Number,
		colorNumber: {
			type: Number,
			default: 1
		}
	}],
	date: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	}
});

moment.locale('ru');

schema.methods.getDate = function() {
	return new moment(this.date).format('DD-MM-YYYY').toUpperCase();
};

schema.methods.getDateCreated = function() {
	return new moment(this.created).format('DD-MM-YYYY HH:mm').toUpperCase();
};

var Map = module.exports = mongoose.model("Map", schema);