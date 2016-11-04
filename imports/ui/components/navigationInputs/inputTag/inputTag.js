import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Countries } from '../../../../api/countries/index';
import template from './inputTag.html';


class InputTag {
	constructor ($scope, $reactive, $rootScope) {
		'ngInject';

		$reactive(this).attach($scope);

		this.searchText = '';

		this.subscribe('countries');

		this.limit = 5;
		this.expanded = false;

		this.root = $rootScope;

		this.helpers({
			countries(){
				return Countries.find({
				  	$or: [
				  		{
				  			"name.es" : {
				  		    	$regex: new RegExp('^' + this.getReactively('searchText')),
				  		    	$options : 'i'
				  		  	}
				  		},{
			  		  		"name.en" : {
			  		  	    	$regex: new RegExp('^' + this.getReactively('searchText')),
			  		  	    	$options : 'i'
			  		  	  	}
				  		}
				  	]
				}, {limit : this.limit});
			}
		});

		$('html').click((event) =>{
			if(this.expanded){
				this.searchText = '';
				this.contractHeader(event);
				$scope.$apply();
			}

		});

		this.catchRootEvents();
	}

	selectCountry (country, event) {
		if(!this.countryAreSelected(country).found){
			this.selected.push(country);
			this.searchText = '';
			this.contractHeader(event);
			this.root.$broadcast('closeCountries', {
				event : event
			});
		}
	}

	removeCountry (country) {
		var index = this.countryAreSelected(country).item;

		this.selected.splice(index,1);
	}

	countryAreSelected (country) {
		var found = false;
		var index = null;

		angular.forEach(this.selected, (countryItem, i) => {
			if (country._id == countryItem._id){
				found = true;
				index = i;
			}
		});

		return {
			found : found,
			index : index
		};
	}

	expandHeader (event) {
		this.root.$broadcast('expandHeader', {
			name : this.name,
			event : event
		});
	}

	contractHeader (event) {
		this.root.$broadcast('contractHeader', {
			name : this.name,
			event : event
		});
	}

	catchRootEvents () {
		this.root.$on('expandedHeader', (event, data) => {
			if(data.name == this.name)
				this.expanded = true;
		});

		this.root.$on('contractedHeader', (event, data) => {
			this.expanded = false;
		});
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
