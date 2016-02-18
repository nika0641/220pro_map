var AdminModel = require(__base + '/models/admin'),
	mError = require(__base + '/libs/error').mError,
	async = require('async'),
	_ = require('underscore'),
	url = require('url'),
	querystring = require('querystring');

exports.authorize = function(req, res, next) {
	AdminModel.authorize(req.body, function(err, data) {
		if (err) return next(new mError(500, err.message));

		if (data.status == 'success') {
			req.session.adminId = data.data._id;
		}
		res.json(data);
	});
};

exports.logout = function(req, res, next) {
	delete req.session.adminId;

	res.redirect('/');
};

exports.checkAuthorize = function(req, res, next) {
	if (!req.admin) {
		return next(new Error('Куда без пароля полез?'));
	} else {
		next();
	}
};

exports.save = function(req, res, next) {
	var id = req.param('id'),
		body = req.body,
		item,
		tasks = [];

	if (id === 'add') {
		tasks.push(
			function(callback) {
				AdminModel.create(body, callback)
			}
		);
	} else {
		tasks.push(
			function(callback) {
				AdminModel.update(id, body, callback);
			}
		);
	}

	async.waterfall(tasks, function(err, response) {
		if (err) return next(new mError(500, err.message));

		res.json(response);
	})
};