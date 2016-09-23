import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngAria from 'angular-aria';

import template from './navigationInputs.html';

class NavigationInputs {
	constructor ($scope, $reactive) {
		'ngInject';

		$reactive(this).attach($scope);

		this.sectionSelected = '';
	}

	onSectionSelected (section) {
		this.sectionSelected = section;
	}

};

const name = 'navigationInputs';

export default angular.module(name, [
	angularMeteor,
	ngAria
]).component(name, {
	template,
	controllerAs : name,
	controller : NavigationInputs
}).config(config);

function config ($ariaProvider) {
	'ngInject';

	$ariaProvider.config({

		tabindex : false,

		bindRoleForClick : false
	});
}

