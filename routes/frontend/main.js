var async = require('async'),
	https = require('https'),
	fs = require('fs'),
	_ = require('underscore'),
	xlsx = require('node-xlsx'),
	mapModel = require(__base + '/models/map'),
	moment = require('moment');


exports.index = function(req, res, next) {
	if (req.admin) {
		res.render('pages/index');
	} else {
		res.render('pages/login')
	}
};



exports.parseXls = function(req, res, next) {
	if (!req.file) {
		return next(new Error('Файл не найден'));
	}


	var data = xlsx.parse(req.file.path)[0].data,
		date = req.file.path.replace(/[^>]*(\d{4})-(\d{2})-(\d{2})-\d{2}-\d{2}-\d{2}[^>]*/, '$2-$3-$1'),
		index = 4,
		orderIndex = 1,
		result = [];

	fs.unlinkSync(req.file.path);

	while (_.keys(data[index]).length && data[index][0] != null) {
		address = data[index][1].replace('RU, ', '');
		var addressLength = address.length;

		if (address.indexOf(address.substr(0, addressLength / 2 - 1), addressLength / 2) != -1) {
			address = address.substr(0, addressLength / 2 - 1);
		}

		var order = {
			number: data[index][0],
			address: address,
			time: data[index][2],
			comment: data[index][3],
			index: orderIndex
		};

		result.push(order);
		index++;
		orderIndex++;
	}

	async.waterfall([
		function(cb) {
			async.map(result, function(order, callback) {
				https.get('https://geocode-maps.yandex.ru/1.x/?format=json&ll=37.6266,55.7464&spn=1.3&1.3&results=1&geocode=' + encodeURI(order.address), function(res) {
					var data = '';

					res.on('data', function(chunk) {
						data += chunk;
					});

					res.on('end', function() {
						try {
							var obj = JSON.parse(data);
						} catch (err) {
							return next('Не могу найти адрес у заказа ' + order.number);
						}

						if (!obj.response || !obj.response.GeoObjectCollection.featureMember.length) {
							return next('Не могу найти адрес у заказа ' + order.number);
						}

						coordinates = obj.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ');
						order.coordinates = [coordinates[1], coordinates[0]];

						callback(null, order);
					});
				});
			}, cb);
		},
		function(result, callback) {
			var map = new mapModel({
				name: req.file.originalname,
				orders: result,
				date: new Date(date)
			});

			map.save(callback);
		}
	], function(err, map) {
		if (err) {
			return next(err);
		}

		res.redirect('/map/' + map.id);
	});
};

exports.viewMap = function(req, res, next) {
	var mapId = req.param('id');

	mapModel.findById(mapId, function(err, map) {
		if (err) {
			return next(err);
		}

		if (!map) {
			return next();
		}

		res.render('pages/map', {
			orders: map.orders,
			mapId: map.id
		});
	})
};

exports.updateMap = function(req, res, next) {
	var orders = req.param('orders'),
		mapId = req.param('mapId');

	async.waterfall([
		function(callback) {
			mapModel.findById(mapId, callback);
		},
		function(map, callback) {
			if (!map) {
				return next(new Error('объект не найден'));
			}

			_.each(orders, function(order, index) {
				map.orders[index].colorNumber = order.colorNumber;
			});

			map.save(callback);
		}
	], function(err, map) {
		if (err) {
			return next(err);
		}

		res.json({
			status: 'success'
		});
	});
};

exports.removeMap = function(req, res, next) {
	var mapId = req.param('id');

	async.waterfall([
		function(callback) {
			mapModel.findById(mapId, callback);
		},
		function(map, callback) {
			if (!map) {
				return callback(new Error('объект не найден'));
			}

			map.remove(callback);
		}
	], function(err) {
		if (err) {
			return next(err);
		}

		res.json({
			status: 'success'
		});
	});
};

exports.mapsList = function(req, res, next) {
	mapModel
		.find()
		.sort('-date')
		.limit(100)
		.exec(function(err, maps) {
			if (err) {
				return next(err);
			}

			res.render('pages/maps', {
				maps: maps
			});
		});
};


exports.error = function(err, req, res, next) {
	console.log(err.stack);

	if (req.xhr) {
		res.status(500).send({
			status: 'error',
			error: err
		});
	} else {
		res.status(500).render('pages/error', {
			error: err
		});
	}
}