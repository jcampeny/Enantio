import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngAria from 'angular-aria';
import matchMedia from 'angular-media-queries';

import { name as InputTag } from './inputTag/inputTag';

import template from './navigationInputs.html';

class NavigationInputs {
	constructor ($scope, $reactive, screenSize) {
		'ngInject';

		$reactive(this).attach($scope);

		this.sectionSelected = '';

		this.isMobile = screenSize.is('xs, sm');
		this.isDesktop = !screenSize.is('xs, sm');

		screenSize.on('xs, sm',(match) =>{
		    this.isDesktop = !match;
		    this.isMobile = match;
		});	
	}

	onSectionSelected (section) {
		this.sectionSelected = section;
		$('#input-' + section).focus();
	}

};

const name = 'navigationInputs';

export default angular.module(name, [
	angularMeteor,
	ngAria,
	InputTag,
	'matchMedia'
]).component(name, {
	template,
	controllerAs : name,
	controller : NavigationInputs
}).filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
}).config(config);

function config ($ariaProvider) {
	'ngInject';

	$ariaProvider.config({

		tabindex : false,

		bindRoleForClick : false
	});
}

