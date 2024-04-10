$(function(){
	$(window).resize(function(){
		resetCartPosition()
	});

	$('#footer').addClass('v2');


	if ($('.addToCart__wrapper').length) {
		var observer = new MutationObserver(function callback(mutationList, observer) {
				mutationList.forEach(function(mutation) {
					if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
						resetCartPosition()
					}
				})
			}
		).observe(header.$el.get(0), {
		  		attributes: true
			}
		)
	}

	// CART MANAGEMENT START
	// $('body').on('submit', '.mod_iso_cart form', function(e) {
	// 	e.preventDefault();
	// 	app.refreshCart($(this).closest('.mod_iso_cart'));
	// });

	// add purchase / leasing
	$('body').on('submit', '.mod_iso_productreader form', function(e) {
		e.preventDefault();
		var url = window.location.pathname;
		if ($(this).closest('.modalFW').length && $(this).closest('.modalFW').modalFW('get').url)
			url = $(this).closest('.modalFW').modalFW('get').url;
		var form = {};
		for (const [key, value] of new FormData(this)) 
			form[key] = value;
		form[$(this).find('input[type=submit].clicked').first().attr('name')] = 1;
		form.TL_AJAX = 1;
		console.log(form);
		$.ajax({
		    timeout: 10000,
		    url: url,
		    method: 'post',
		    data: form,
		    statusCode: {
                303: function(data) {
                	console.log(data);
                }
            }
		}).done(function(data){
			if (typeof data !== 'object')
		    	try{data = $.parseJSON(data); } catch(e){throw e;}
		    if (data.status == "success"){
		        notif_fade.success(data.msg);
		       	// app.refreshCart($('.mod_iso_cart').first());
		       	app.refreshCarts();
		    }
		    else {
		        throw data.msg
		    }
		}).fail(function(jqXHR, textStatus){
			console.log('error');
			console.log(jqXHR, textStatus);
		    // reject();
		});
	});
	$('body').on('click', '.mod_iso_productreader input[type=submit]', function(e) {
		$(this).closest('form').find('input[type=submit]').removeClass('clicked');
		$(this).addClass('clicked');
	});
	
	// update item quantity
	var timerSubmit;
	$('body').on('change', '.mod_iso_cart input[name*=quantity]', function(e) {
        clearTimeout(timerSubmit);
        var input = this;
        timerSubmit = setTimeout(function(){
            $(input).blur().closest('tr.product').addClass('loading');
            if (input.value != 0){
            	return new Promise(function(resolve,reject){
	            	var form = {};
					for (const [key, value] of new FormData(input.closest('form'))) 
						form[key] = value;
					form['button_update'] = 1;
					form.TL_AJAX = 1;
					console.log(form);
					$.ajax({
					    timeout: 10000,
					    url: window.location.pathname,
					    method: 'post',
					    data:form,
					    statusCode: {
			                303: function(data) {
			                	resolve()
			                }
			            }
					}).done(function(data){
					    if (typeof data !== 'object')
					        try{ data = $.parseJSON(data); } catch(e){throw e;}
					    // console.log(data);
					    if (data.status == "success"){
					        resolve();
					    } 
					    else {
					        throw data.msg
					    }
					}).fail(function(jqXHR, textStatus){
					    if (jqXHR.status == 303) 
					    	resolve()
					    else {
				        	console.log(jqXHR, textStatus);
			  				notif.error(textStatus);
			  				reject()
			        	} 
					});
				}).then(function(){
					console.log('success update');
                	// app.refreshCart($(input).closest('.mod_iso_cart'));
                	app.refreshCarts();
				});
            }
            else {
            	if(confirm('Voulez vous supprimer cet élément de votre panier ?') == true)
                	$(input).closest('tr.product').find('.remove').trigger('click');
                else{
            		$(input).closest('tr.product').removeClass('loading');
                	input.value=1;
                }
            }
        },500)
    });

	// remove item
	$('body').on('click', '.mod_iso_cart .remove', function(e) {
		e.preventDefault();
        var btn = $(this);
        var form = btn.closest('form');
        var data = { 
          FORM_SUBMIT: form.find('input[name="FORM_SUBMIT"]').val(),
          REQUEST_TOKEN: form.find('input[name="REQUEST_TOKEN"]').val(),
        };
        // console.log(btn,form,data);

        $.ajax({
            method: "POST",
            url: $(this).attr('href'),
            data: data,
            statusCode: {
                303: function() {
                	app.refreshCarts();
                   // app.removeCartLine(btn.closest('tr.product'));
                }
            }
        })
        .done(function( data ){
        	app.refreshCarts();
            // app.removeCartLine(btn.closest('tr.product'));
        }).fail(function(jqXHR, textStatus){
        	if (jqXHR.status != 303) {
	        	console.log(jqXHR, textStatus);
  				notif.error(textStatus);
        	}
		});
	});


	// app.removeCartLine = function(line){
	// 	$(line).fadeOut(400, function() {
    //       	var cart = $(this).closest('.mod_iso_cart');
    //       	$(this).remove();
    //       	if (!cart.find('tr.product').length)
    //       		window.location.reload();
    //       	else
    //       		app.syncCartsProducts(cart);
    //     });
	// }

	// app.syncCartsProducts = function(cart){
  	// 	var lines = $(cart).find('tr.product');
    // 	// Refresh cart header button
  	// 	if ($('.headerFW__postnav .cart').length)
  	// 		$('.headerFW__postnav .cart .nb_items').html(lines.length);
    // 	// Refresh other cart if needed
    // 	if ($('.mod_iso_cart').length > 1) {
    // 		$('.mod_iso_cart').not(cart).each(function(){
    // 			$(this).find('table tr.product').remove();
    // 			var linesClone = lines.clone()
    // 			linesClone.find('.input-number__container').each(function(){
    // 				$(this).replaceWith($(this).find('input[type=number]'))
    // 			})
    // 			$(this).find('table').html(linesClone);
    // 		})	
    // 	}
	// }

	// app.refreshCart = function(cart){
	// 	var cart = $(cart);
	// 	var data = {
	// 		action : 'wemReloadModule',
	// 		module : cart.data('moduleid'),
	// 		REQUEST_TOKEN : cart.find('input[name=REQUEST_TOKEN]').val(),
	// 		TL_AJAX: 1,
	// 	};
	// 	console.log(data);
	// 	$.ajax({
	// 	    timeout: 10000,
	// 	    url: window.location.pathname,
	// 	    method: 'post',
	// 	    data: data,
	// 	}).done(function(data){
	// 	    if (typeof data !== 'object')
	// 	        try{ data = $.parseJSON(data); } catch(e){throw e;}
	// 	    // console.log(data);
	// 	    if (data.status == "success"){
	// 	        cart = cart.wrapAll('<div></div>').parent().html(data.html).children().unwrap();
	// 	        app.syncCartsProducts(cart);
	// 	    }
	// 	    else {
	// 	        throw data.msg
	// 	    }
	// 	}).fail(function(jqXHR, textStatus){
	// 	    // reject();
	// 		console.log(jqXHR, textStatus);
	// 	});
	// }


	app.refreshCarts = function(){
		return new Promise(function(resolve,reject){
		    $('.mod_iso_cart').each(function(c,cart){
		    	cart= $(cart);
		    	console.log(cart);
		    	var data = {
		    		action : 'wemReloadModule',
		    		module : cart.data('moduleid'),
		    		REQUEST_TOKEN : cart.find('input[name=REQUEST_TOKEN]').val(),
		    		TL_AJAX: 1,
		    	};
		    	$.ajax({
		    	    timeout: 10000,
		    	    url: window.location.pathname,
		    	    method: 'post',
		    	    data: data,
		    	}).done(function(data){
		    	    if (typeof data !== 'object')
		    	        try{ data = $.parseJSON(data); } catch(e){throw e;}
		    	    console.log(data);
		    	    if (data.status == "success"){
		    	        cart = cart.wrapAll('<div></div>').parent().html(data.html).children().unwrap();
		    	    }
		    	    else {
		    	        throw data.msg
		    	    }
		    	}).fail(function(jqXHR, textStatus){
		    	    // reject();
		    		console.log(jqXHR, textStatus);
		    	});
		    })
		});
	}

	// CART MANAGEMENT END
    $('body').on('click','.job_default',function(e){
    	if (!$(e.target).hasClass('job__more'))
			$(this).find('.job__more').trigger('click');
	});

	$('body').on('click', '.iso__subproducts .table-list__line .table-list__cell[data-name=picture],.iso__subproducts .table-list__line .table-list__cell[data-name=name],.iso__subproducts .table-list__line .table-list__cell[data-name=teaser]', function(e) {
		$(this).closest('.table-list__line').find('.table-list__action[data-modal]').trigger('click')
	});

});

var resetCartPosition = function(){
	$('.addToCart__wrapper').css({
		'top' : $('.headerFW').outerHeight(),
	})
}