global.__base = __dirname;

var express = require('express'),
	http = require('http'),
	path = require('path'),
	config = require('./config/config.js'),
	mongoose = require('./libs/mongoose'),
	MongoStore = require('connect-mongo')(express);

var app = express();

app.set('env', config.get('env'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.favicon(path.join(__dirname, '/images/logo.png')));
app.use('/cache', express.static(path.join(__dirname, 'cache')));
app.use('/storage', express.static(path.join(__dirname, 'storage')));
app.use(express.session({
	secret: config.get('session:secret'),
	key: config.get('session:key'),
	cookie: config.get('session:cookie'),
	store: new MongoStore({
		mongoose_connection: mongoose.connection
	})
}));

if (app.get('env') == 'dev') {
	app.use(express.errorHandler());
	app.use(express.static(path.join(__dirname, 'public')));
} else if (app.get('env') == 'prod') {
	app.use(express.static(path.join(__dirname, 'public'), {
		maxAge: 31557600000 //oneYear
	}));
}

app.use(require('./middleware/clear-url'));
app.use(require('./middleware/load-admin'));

app.use(app.router);
require('./routes/index')(app);


http.createServer(app).listen(config.get('port'), function() {
	console.log('Express server listening on port ' + config.get('port'));
});