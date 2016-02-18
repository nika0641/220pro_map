(function($) {

	var yandexMap = function(container, options) {
		this.container = container[0];
		this.init(options);
	};

	yandexMap.prototype = {
		options: {
			maxZoom: 18,
			minZoom: 5,
			defaultZoom: 11,
			defaultCenter: [55.745, 37.62],
			controls: ['geolocationControl', 'fullscreenControl']
		},

		init: function(options) {
			this.options = $.extend(this.options, options);
			this.editMode = $(this.container).data('editMode');
			this.initLayouts();
			this.initMap();
			this.initControls();
			this.bindEvents();
		},

		initMap: function() {
			this.Map = new ymaps.Map(this.container, {
				center: this.options.defaultCenter,
				zoom: this.options.defaultZoom,
				controls: this.options.controls
			}, {
				maxZoom: this.options.maxZoom,
				minZoom: this.options.minZoom
			});
		},

		initControls: function() {
			var zoomControl = new ymaps.control.ZoomControl({
				options: {
					position: {
						left: 'auto',
						right: 10,
						top: 108
					}
				}
			});
			this.Map.controls.add(zoomControl);
		},

		initLayouts: function() {
			var self = this;

			this.layouts = {};

			this.layouts.placemark = ymaps.templateLayoutFactory.createClass("\
                <div class='placemark placemark-border-color js-placemark color-{{properties.colorNumber}}'>\
                    <div class='placemark-content'>{{properties.index}}</div>\
                </div>\
            ");

			if (self.editMode) {
				this.layouts.balloonContent = ymaps.templateLayoutFactory.createClass("\
                <div class='balloon-block'>\
                    <div class='balloon-content'>\
                    	<div class='colors-row'>\
		                    {% for i in properties.colors %}\
							    <div class='color-block placemark-border-color js-color-block color-{{i}} {% if properties.colorNumber == i %} active {% endif %}'></div>\
							{% endfor %}\
	                    </div>\
                    </div>\
                </div>\
            ", {
					build: function() {
						this.constructor.superclass.build.call(this);

						this._$element = $('.balloon-block', this.getParentElement());
						this._$element.find('.js-color-block')
							.on('click', $.proxy(this.onColorClick, this));
					},
					onColorClick: function(e) {
						var color = $(e.toElement).index() + 1,
							data = this.getData(),
							index = data.properties.get('index') - 1;

						data.properties.set('colorNumber', color);
						ordersData[index].colorNumber = color;
						changeOrderColor(index, color);

						this.events.fire('userclose');
					}
				});
			}

			this.placemarks = {};

			this.placemarks.standard = {
				cursor: "pointer",
				iconImageOffset: [-15, -40],
				iconImageSize: [30, 40],
				iconImageHref: '',
				iconContentLayout: self.layouts.placemark,
				iconLayout: 'default#imageWithContent',
				balloonContentLayout: self.layouts.balloonContent,
				balloonShadow: false
			};
		},

		bindEvents: function() {
			var self = this;

		},

		addPlacemark: function(coordinates, properties) {
			properties.colors = [1, 2, 3, 4, 5, 6, 7, 8];

			var template = this.options.balloonTemplate || 'standard',
				placemark = new ymaps.Placemark(coordinates, properties, this.placemarks[template]);

			placemark.events.add('contextmenu', function(e) {
				selectOrder(properties.index);
			});

			this.Map.geoObjects.add(placemark);
			return placemark;
		},

		removePlacemark: function(placemark) {},

		clearMap: function() {
			var that = this;
			this.Map.geoObjects.removeAll();
		},

		setMapCenter: function(coordinates) {
			this.Map.setBounds(coordinates || this.Map.geoObjects.getBounds());
		},

		setCenter: function(coordinates) {
			this.Map.setCenter(coordinates, 13);
		},

		setPlacemarks: function(data) {
			var self = this,
				places = _.map(data, function(point) {
					return self.addPlacemark(point.coordinates, point);
				});
			return places;
		},
	};

	$.fn.yandexMap = function(option, val) {
		$(this).each(function(i, element) {
			var element = $(element),
				data = element.data('yandexMap'),
				options = typeof option == 'object' && option;

			if (!data) {
				element.data('yandexMap', (data = new yandexMap(element, options)));
			} else {
				element.children().remove();
				element.data('yandexMap', (data = new yandexMap(element, options)));
			}
		});
	};

})(jQuery);