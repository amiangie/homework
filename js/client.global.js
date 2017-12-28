/* Create HTML5 elements for ancient browsers */
document.createElement('header')
document.createElement('footer')
document.createElement('nav')
document.createElement('article')
document.createElement('section')
/* end Create HTML5 elements for ancient browsers */

$(function() {
	
	$('.js-nav-trigger').on('click', function(e){
		e.preventDefault();
		var $target = $($(this).data('target'));
		$target.stop(false, true).slideToggle();
	});
	$('.js-subnav-trigger').on('click', function(e){
		e.preventDefault();
		$(this).next('ul').stop(false, true).slideToggle();
	});
	
	
	// populate cart with items
	var itemTemplate = $('#cart-item').html(),
		$itemsHolder = $('.js-items');
	cachedAjaxCall('cartContent', 'cart/get', 60, function(data) {
		$('.js-total-items').html(data.totalItems);
		$('.js-total-price').html(data.totalPrice);
		var items = data.items;
		var html = items.map(function(item) {
			return itemTemplate
				.replace('[LINK]', item.imgSrc)
				.replace('[ALT]', item.name)
				.replace('[NAME]', item.name)
				.replace('[QTY]', item.qty)
				.replace('[PRICE]', item.price)
		}).join('');
		$itemsHolder.html(html);
	});

	
	// newsletter
	$('.js-newsletter-form').on('submit',function(e){
    	e.preventDefault();
		$('.js-newsletter-message').addClass('hidden');
		
		if(validateEmail($('.js-validate-email'))) {
			var emailDetails = JSON.stringify($('.js-newsletter-form').serializeObject());
			
			$('.js-newsletter-loading').removeClass('hidden');
			
			setTimeout(function () {
				$.ajax({
					type: 'POST',
					url: 'newsletter/subscribe',
					data: emailDetails,
					contentType: 'application/json',
					success: function(data){
						$('.js-newsletter-message').addClass('hidden');
						$('.js-newsletter-success').removeClass('hidden');
					},
					error: function(data) {
						$('.js-newsletter-message').addClass('hidden');
						$('.js-newsletter-error').removeClass('hidden');
					}
				});
			}, 500);
		}
	});
	
})

function cachedAjaxCall(key, callURL, expireSeconds, callback) {
	var now = (new Date).getTime() / 1000;
	var expired = false;

	if (localStorage.getItem(key) === null) {
		expired = true;
	}
	else if ((now - JSON.parse(localStorage.getItem(key)).lastCall) > expireSeconds) {
		expired = true;
	}
	else {
		expired = false;
	}

	if (expired) {
		$.ajax({
			url: callURL,
			success: function(data) {
				console.log('Local data expired, making an ajax call');
				localStorage.setItem(key, JSON.stringify({ value: data, lastCall: now }));
				callback(data);
			}
		})
	}
	else {
		console.log('Using local data');
		callback(JSON.parse(localStorage.getItem(key)).value);
	}
}

function validateEmail($input) {
	var exp = /^[a-zA-Z0-9]+[a-zA-Z0-9_.-]+[a-zA-Z0-9_-]+@[a-zA-Z0-9]+[a-zA-Z0-9.-]+[a-zA-Z0-9]+.[a-z]{2,4}$/;
	var email = $input.val();
	if(exp.test(email)){
		$('.js-newsletter-message').addClass('hidden');
		$('.js-newsletter-loading').removeClass('hidden');
		return true;
	}
	else{
		$('.js-newsletter-message').addClass('hidden');
		$('.js-newsletter-error').removeClass('hidden');
		return false;
	}
};

$.fn.serializeObject = function(){
	var o = {};
	var a = this.serializeArray();
	$.each(a, function() {
		if (o[this.name] !== undefined) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
}