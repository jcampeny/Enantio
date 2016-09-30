import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Countries } from '../../../../api/countries/index';
import template from './inputTag.html';


class InputTag {
	constructor ($scope, $reactive) {
		'ngInject';

		$reactive(this).attach($scope);

		this.searchText = '';

		this.subscribe('countries');

		this.helpers({
			countries(){
				return Countries.find({
					name : {
				    	$regex: new RegExp('^' + this.getReactively('searchText')),
				    	$options : 'i'
				  	}
				}, {limit : 5});
			}
		});
	}

	selectCountry (country) {
		this.selected = country;
		console.log(country);
	}


};

const name = 'inputTag';

export default angular.module(name, [
	angularMeteor
]).component(name, {
	template,
	bindings : {
		name : '@',
		selected : '='
	},
	controllerAs : name,
	controller : InputTag
});
