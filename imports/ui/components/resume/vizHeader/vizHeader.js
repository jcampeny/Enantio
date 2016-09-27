import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './vizHeader.html';

class VizHeader {
	constructor ($scope, $reactive, $state) {
		'ngInject';

		$reactive(this).attach($scope);

		this.state = $state;
			
	}

	refresh () {
		this.vizController.refresh(this.vizController.name);
	}

	expand () {
		const e = $('[viz="'+this.vizController.id+'"]');
		const startW = e.width();
		const startH = e.height();
		const documentW = $(document).width();
		const documentH = $(document).height();
		const windowH = $(window).height();
		const originalMargin = 20;
		var margin = originalMargin;
		var offset = e.offset();//left,top

		margin = (documentH > windowH ) ? margin : margin*2; //has scroll

		const css = {
			'top': 110 - originalMargin + 'px',
			'left': 20 - originalMargin + 'px',
			'max-width' : (documentW - margin) + 'px',
			'margin' :originalMargin + 'px',
			'position' : 'fixed'
		};

		$('[viz]').css({'opacity' : '0'});
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
					$('[viz], [countries]').not('[viz="'+this.vizController.id+'"]').css({'display' : 'none'});
					e.css({
						'transition' : '',
						'max-width' : 'calc(100% - ' + originalMargin * 2 + 'px)',
						'position' : ''
					});
				}
			},
		);
		
	}

};

const name = 'vizHeader';

export default angular.module(name, [
	angularMeteor
]).component(name, {
	template,
	bindings : {
		vizController : '='
	},
	controllerAs : name,
	controller : VizHeader
});

