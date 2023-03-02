$(function(){
	var header;
	if (app.components.includes('headerFWOld'))
      	header = $('#header').headerFWOld('get');
  	else if (app.components.includes('headerFW'))
		header = $('#header').headerFW('get');
	header.$stickyEl = $('#container');


	$(window).resize(function(){
		resetCartPosition()
	});

	
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

	var timerSubmit;
    $('.mod_iso_cart input[name*=quantity]').on('change',function(){
        clearTimeout(timerSubmit);
        var input = this;
        timerSubmit = setTimeout(function(){
            if (input.value != 0) 
                input.closest('form').submit();
            else {
            	if(confirm('Voulez vous supprimer cet élément de votre panier ?') == true)
                	input.closest('form').submit();
                else
                	input.value=1;
            }
        },500)
    })


    $('body').on('click','.job_default',function(e){
    	if (!$(e.target).hasClass('job__more'))
			$(this).find('.job__more').trigger('click');
	})
});

var resetCartPosition = function(){
	$('.addToCart__wrapper').css({
		'top' : $('.headerFW').outerHeight(),
	})
}