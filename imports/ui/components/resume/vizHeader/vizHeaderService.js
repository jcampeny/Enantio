import matchMedia from 'angular-media-queries';

class VizHeaderService
{
  	constructor(screenSize, $q){
  		'ngInject';

  		this.q = $q;

  		this.isMobile = screenSize.is('xs, sm');
  		this.isDesktop = !screenSize.is('xs, sm');

  		screenSize.on('xs, sm',(match) =>{
  		    this.isDesktop = !match;
  		    this.isMobile = match;
  		});	

  	}
	contract (id){
		var deferred = this.q.defer();

		const e = $('[viz="'+id+'"]');
    const fadeUp = (this.isMobile) ? '0px' : '50px';
		const css = {
			'opacity' : '1',
			'transition' : '',
			'max-width' : '',
			'margin' : '',
			'left' : '',
			'width' : '',
			'position' : 'relative',
			'top' : '0px'
		};

		e.css({'opacity' : '0'});

		$('[countries]')
		  .delay(400)
		  .queue(function (next) { 
		    $(this).css('margin', ''); 
		    showAllContainers();
		    next(); 
		  });

		function showAllContainers() {
			TweenMax.staggerFromTo(
				'[viz]', 
				0.5, //duration
				{
					css : {			
						'display' : '',
						'opacity' : '0',
						'transition' : 'none',
						'top' : fadeUp
					}
				},
				{//to
					ease: Power3.easeOut, 
					css
				},
				0.2,
				() => {
					deferred.resolve('contracted');
					$('[viz]').css({
						'top' : '',
						'position' : ''
					});
				}
			);			
		}


		return deferred.promise;
	}

  	expand(id){
  		var deferred = this.q.defer();

  		const e = $('[viz="'+id+'"]');
  		const startW = e.width();
  		const startH = e.height();
  		const documentW = $(document).width();
  		const documentH = $(document).height();
  		const windowH = $(window).height();
  		const originalMargin = 20;
  		var margin = originalMargin;
  		var offset = e.offset();//left,top

  		margin = (documentH > windowH ) ? margin : margin*2; //has scroll

  		var css = {
  			'top': 110 - originalMargin + 'px',
  			'left': 20 - originalMargin + 'px',
  			'max-width' : (documentW - 4 - margin) + 'px',
  			'margin' :originalMargin + 'px',
  			'position' : 'fixed'
  		};;

  		if(this.isMobile){
  			css.top = 152 - originalMargin + 'px';
  			css['max-width'] = (documentW - originalMargin*2) + 'px';
  			offset = {
  				top:  offset.top - $(document).scrollTop(),
  				left: offset.left - $(document).scrollLeft()
  			};
  		}


  		$('[viz]').css({'opacity' : '0'});
  		$('[countries]')
  		  .delay(400)
  		  .queue(function (next) { 
  		    $(this).css('margin', '0'); 
  		    next(); 
  		  });

  		e.css({'opacity' : '1'});

  		$('html,body')
  			.delay(400)
  			.animate({
  			    scrollTop: 0
  			},  500);

  		TweenMax.fromTo(
  			e, 
  			1, //duration
  			{
  				css : {			
  					'width' : '100%',
  					'max-width' : startW + 'px',
  					'top' : offset.top - originalMargin + 'px',
  					'left' : offset.left - originalMargin + 'px',
  					'transition' : 'none'
  				}
  			},
  			{//to
  				delay : 0.4,
  				ease: Power3.easeOut, 
  				css,
  				onComplete : () => {
  					$('[viz]').not('[viz="'+id+'"]').css({'display' : 'none'});
  					e.css({
  						'transition' : '',
  						'max-width' : 'calc(100% - ' + originalMargin * 2 + 'px)',
  						'position' : '',
              'z-index' : '25'
  					});
  					deferred.resolve('expanded');
  				}
  			},
  		);

  		return deferred.promise;
  	}
	
}

const name = 'vizHeaderServices';

export default angular.module(name, ['matchMedia'])
	.service(name, VizHeaderService);
