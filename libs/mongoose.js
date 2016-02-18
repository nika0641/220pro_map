var mongoose = require('mongoose');
var config = require(__base + '/config/config.js');

mongoose.connect(config.get('mongoose:uri'));
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

module.exports = mongoose;