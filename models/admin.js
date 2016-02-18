var mongoose = require(__base + '/libs/mongoose'),
	crypto = require('crypto'),
	_ = require('underscore'),
	async = require('async'),
	mResponse = require(__base + '/libs/response').mResponse;

var schema = mongoose.Schema({
	login: String,
	hashedPassword: String,
	salt: String,
});



schema.virtual('password')
	.set(function(password) {
		this._plainPassword = password;
		this.salt = Math.random() + '';
		this.hashedPassword = this.encryptPassword(password);
	})
	.get(function() {
		return this._plainPassword;
	});



schema.methods.encryptPassword = function(password) {
	return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.methods.checkPassword = function(password) {
	return this.encryptPassword(password) === this.hashedPassword;
};



schema.statics.authorize = function(data, cb) {

	async.waterfall([

		function(callback) {
			if (!data.login) return callback(null, false);

			data.login = data.login.toLowerCase();
			Admin.findOne({
				login: data.login
			}, callback);
		},
		function(admin, callback) {
			if (admin && admin.checkPassword(data.password)) {
				callback(null, new mResponse('success', admin));
			} else {
				callback(null, new mResponse('error', {
					login: 'неверный пароль или логин'
				}));
			}
		}
	], cb);
};

schema.statics.create = function(data, cb) {
	async.waterfall([

		function(callback) {
			if (!data.login) return callback(null, false);

			data.login = data.login.toLowerCase();
			Admin.findOne({
				login: data.login
			}, callback);
		},
		function(admin, callback) {
			var err = {};
			if (admin) err.login = 'данный логин уже используется';
			if (!data.password || data.password.length < 8) err.password = 'пароль должен быть больше 8 символов';
			if (Object.keys(err).length) return cb(null, new mResponse('error', err));

			var admin = new Admin(data);
			admin.save(callback)
		},
		function(admin, r, callback) {
			callback(null, new mResponse('success', admin));
		}
	], cb);
};

schema.statics.remove = function(id, cb) {
	async.waterfall([

		function(callback) {
			if (!id) return callback(null, false);

			Admin.findOne({
				_id: id
			}, callback);
		},
		function(admin, callback) {
			if (!admin) return cb(null, new mResponse('error', 'пользователь не найден'));

			admin.remove(callback);
		},
		function(admin, callback) {
			callback(null, new mResponse('success'));
		}
	], cb);
};

schema.statics.update = function(id, data, cb) {
	async.waterfall([

		function(callback) {
			if (!id) return callback(null, false);

			Admin.findOne({
				_id: id
			}, callback);
		},
		function(admin, callback) {
			if (!admin) return cb(null, new mResponse('error', 'пользователь не найден'));

			_.each(admin, function(val, key) {
				admin[key] = data[key] || val;
			});
			
			admin.save(callback);
		},
		function(admin, r, callback) {
			callback(null, new mResponse('success', admin));
		}
	], cb);
}


var Admin = module.exports = mongoose.model("Admin", schema);