//= assets/js/libs/jquery/jquery.js
//= assets/js/libs/underscore/underscore.js
//= assets/js/libs/noty/jquery.noty.packaged.js
//= assets/js/map.js

$(function() {
	$.noty.defaults.layout = 'topRight';
	$.noty.defaults.theme = 'relax';
	$.noty.defaults.type = 'success';
	$.noty.defaults.dismissQueue = true;
	$.noty.defaults.timeout = 3000;
	$.noty.defaults.maxVisible = 5;


	var $map = $('#map'),
		mapObject,
		$ordersContainer = $('.js-orders-container'),
		$orders = $('.js-order'),
		placemarks;

	typeof ymaps !== 'undefined' && $map.length && ymaps.ready(function() {
		$map.yandexMap();

		mapObject = $map.data('yandexMap');

		window.ordersData = $('[data-orders]').data('orders');

		placemarks = mapObject.setPlacemarks(ordersData);
	});

	window.selectOrder = function(index) {
		var $element = $orders.eq(index - 1),
			parentScrollTop = $ordersContainer.scrollTop(),
			elementOffsetTop = $element.offset().top,
			scrolloTop = 0;

		if (elementOffsetTop > parentScrollTop) {
			scrollTop = elementOffsetTop;
		} else {
			scrollTop = elementOffsetTop + parentScrollTop;
		}

		$ordersContainer.animate({
			scrollTop: scrollTop
		}, 500);

		$element.addClass('hover');
		setTimeout(function() {
			$element.removeClass('hover');
		}, 1000);
	};

	window.changeOrderColor = function(index, color) {
		$orders.eq(index).find('.placemark-border-color').removeClass('color-1 color-2 color-3 color-4 color-5 color-6 color-7 color-8').addClass('color-' + color);
	};

	$.fn.addFormSubmit = function(cb, cbBefore) {
		var $form = this;
		$form.on('submit', function(event) {
			event.preventDefault();
			var $form = $(this);

			cbBefore && cbBefore();
			$form.find('.submit-preloader').removeClass('hide');
			$form.find('button[type="submit"]').attr('disabled', 'disabled');
			$.ajax({
					url: $form.attr('action'),
					type: $form.attr('method'),
					data: $form.serialize(),
				})
				.done(function(response) {
					$form.find('.submit-preloader').addClass('hide');
					$form.find('button[type="submit"]').removeAttr('disabled');
					showErrors($form, response.error, response.message);
					cb && cb(response);
				});
		});
		return this;
	};



	// Show form errors method
	window.showErrors = function($form, errors, message) {
		$form.find('span.error').text('');
		$form.find('input, textarea').closest('.form-group').removeClass('has-error');
		_.each(errors, function(value, key) {
			$field = $form.find('[name="' + key + '"]');
			$field.closest('.form-group').addClass('has-error');
		});
		$form.find('.form-group.has-error input, .form-group.has-error textarea.error').eq(0).focus();
		if (typeof message !== "undefined") alert(message);
	};

	$orders.on('click', function(event) {
		var $this = $(this),
			index = $this.index();

		mapObject.setCenter(placemarks[index].properties.get('coordinates'));
	});

	$('.js-save-button').on('click', function(event) {
		event.preventDefault();
		$.ajax({
				url: '/update',
				type: 'POST',
				data: {
					orders: ordersData,
					mapId: $('[data-map-id]').data('mapId')
				}
			})
			.done(function(response) {
				if (response.status == 'success') {
					noty({
						text: 'успешно сохранено'
					});
				} else {
					noty({
						text: 'ошибка при сохранении',
						type: 'error'
					});
				}
			})
			.fail(function() {
				noty({
					text: 'ошибка при сохранении',
					type: 'error'
				});
			});
	});

	$('input[type="file"]').on('change', function() {
		$('.js-logo-rotate').addClass('rotate');
		$('.js-file-upload-form').submit();
	});

	$('.js-file-upload-form').removeClass('hidden');

	$('.js-login-form').addFormSubmit(function(response) {
		if (response.status == 'success') {
			document.location = '/';
		}
	});

	$('.js-remove-map').on('click', function(event) {
		event.preventDefault();

		if (!confirm('Вы действительно хотите удалить?')) {
			return;
		}

		var $that = $(this);

		$.ajax({
				url: $that.attr('href'),
				type: 'POST'
			})
			.done(function(response) {
				if (response.status == 'success') {
					$that.closest('tr').remove();
				} else {
					noty({
						text: response.message || 'ошибка при удалении',
						type: 'error'
					});
				}

			})
			.fail(function() {
				noty({
					text: 'ошибка при сохранении',
					type: 'error'
				});
			});
	});
});