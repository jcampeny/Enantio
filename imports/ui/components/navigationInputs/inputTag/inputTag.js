import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Countries } from '../../../../api/countries/index';
import template from './inputTag.html';

import {name as FiltersService} from '../../dataviz/filtersService';

class InputTag {
	constructor ($scope, $reactive, $rootScope, filtersService) {
		'ngInject';

		$reactive(this).attach($scope);

		this.searchText = '';

		this.subscribe('countries');

		this.limit = 5;
		this.expanded = false;
		this.name = $scope.name;

		this.root = $rootScope;
		this.filtersService = filtersService;

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
				  			$where : (object)=>{
				  				var found = false;
				  				var text = this.searchText;

				  				angular.forEach(object.name, (value, key) => {
				  					var regExp = new RegExp('^' + text);
				  					if(value.toLowerCase().match(regExp))
				  						found = true;
				  				});

				  				return found;
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

			if(this.name === "importador"){
				this.filtersService.importers.push(country.code);
			}else if(this.name === "exportador"){
				this.filtersService.exporters.push(country.code);
			}
			this.root.$broadcast('refreshDBData');
		}
	}

	removeCountry (country) {
		var index = this.countryAreSelected(country).item;

		this.selected.splice(index,1);

		if(this.name === "importador"){
			var i = this.filtersService.importers.indexOf(country.code);
			this.filtersService.importers.splice(i,1);
		}else if(this.name === "exportador"){
			var i = this.filtersService.exporters.indexOf(country.code);
			this.filtersService.exporters.splice(i,1);
		}
		this.root.$broadcast('refreshDBData');
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
