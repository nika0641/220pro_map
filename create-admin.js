global.__base = __dirname;
var Admin = require('./models/admin');

var admin = new Admin({
	'login': 'admin',
	'password': 'GfHjKbOt'
});

admin.save();