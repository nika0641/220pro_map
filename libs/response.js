function mResponse() {
	var result = {
		status: undefined,
		message: undefined,
		data: undefined,
		error: {}
	};

	switch (arguments[0]) {
		case 'error':
			result.status = 'error';
			if (typeof arguments[1] === 'string') {
				result.message = arguments[1];
				if (typeof arguments[2] === 'object') {
					result.error = arguments[2];
				}
			} else {
				if (typeof arguments[1] === 'object') {
					result.error = arguments[1];
				}
			}

			break;

		case 'success':
			result.status = 'success';
			result.data = arguments[1];

			break;

		default:
			result.status = arguments[0];
			result.data = arguments[1];

			break;
	}

	return result;
}

exports.mResponse = mResponse;