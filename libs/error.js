var http = require('http');

function mError(status, message) {
	return {
		status: status,
		message: message || http.STATUS_CODES[status] || "Error"
	};
};

exports.mError = mError;