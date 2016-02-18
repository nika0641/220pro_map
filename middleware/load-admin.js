var AdminModel = require(__base + '/models/admin');

module.exports = function(req, res, next) {
	req.admin = res.locals.admin = undefined;

	if(!req.session.adminId) {
		next();
	} else {
		AdminModel.findById(req.session.adminId, function (err, user) {
			if(err) return next(err);
			req.admin = res.locals.admin = user;
			next();
		})
	}
}