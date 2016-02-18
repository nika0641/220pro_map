module.exports = function(req, res, next) {
	if (req.url[req.url.length - 1] == '/' && req.url.length > 1)
		res.redirect(301, req.url.slice(0, -1));
	else
		next();
};