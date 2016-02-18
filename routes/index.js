var mainRoute = require(__base + '/routes/frontend/main'),
	adminRoute = require(__base + '/routes/frontend/admin'),
	config = require(__base + '/config/config.js'),
	multer = require('multer'),
	upload = multer({
		fileFilter: function(req, file, cb) {
			if (new RegExp('\.xls$', 'i').test(file.originalname)) {
				cb(null, true);
			} else {
				cb(new Error('Данный формат файла не поддерживается'));
			}
		},
		storage: multer.diskStorage({
			destination: function(req, file, cb) {
				cb(null, __base + '/tmp');
			},
			filename: function(req, file, cb) {
				cb(null, file.originalname.replace(/(.*)(\.(?=[^.]*$))(\w+)/, '$1-' + Date.now() + '.$3'));
			}
		})
	});

module.exports = function(app) {
	app.post('/login', adminRoute.authorize);
	app.all('/logout', adminRoute.logout);
	app.get('/', mainRoute.index);
	app.get('/map/:id', mainRoute.viewMap);
	app.all('/*', adminRoute.checkAuthorize);


	app.post('/parsexls', upload.single('file'), mainRoute.parseXls);
	app.post('/update', mainRoute.updateMap);
	app.get('/maps', mainRoute.mapsList);
	app.post('/map/:id/remove', mainRoute.removeMap);


	app.use(function(req, res) {
		res.status(404);
		res.render('pages/404');
	});

	app.use(mainRoute.error);

};