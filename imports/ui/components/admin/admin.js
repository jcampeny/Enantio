import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import { Countries } from '../../../api/countries/index';

import template from './admin.html';

import {name as PopUp} from '../popUp/popUp';

class Admin {
	constructor ($scope, $reactive, $rootScope, $state) {
		'ngInject';

		$reactive(this).attach($scope);

		this.root = $rootScope;
		this.state = $state;

		this.root.isAdmin = false;

		this.selectedCountry = null;

		Meteor.call('isInRole', 
			(error, response) => {
				this.root.isAdmin = response;
			}
		);

		this.perPageOptions = [5, 10, 15, 20, 25];
		this.perPage = 5;
		this.page = 1;
		this.sort = {
			"name.es" : 1
		};
		this.searchText = '';

		this.helpers({
			countries(){
				return Countries.find({
					$or: [{
						$where : (object)=>{
							var found = false;
							var aaaa = this.getReactively('searchText');
							var text = this.searchText;

							angular.forEach(object.name, (value, key) => {
								var regExp = new RegExp('^' + text);
								if(value.toLowerCase().match(regExp))
									found = true;
							});

							return found;
						}
					},{
						"name.es" : {
					    	$regex: new RegExp('^' + this.getReactively('searchText')),
					    	$options : 'i'
					  	}
					}]
				}, {
					limit : parseInt(this.getReactively('perPage')),
					skip : parseInt((this.getReactively('page') - 1) * this.perPage),
					sort : this.getReactively('sort', true)
				});
			},
			totalPages(){
				return Math.ceil(Countries.find({
					$or: [{
						$where : (object)=>{
							var found = false;
							var aaaa = this.getReactively('searchText');
							var text = this.searchText;

							angular.forEach(object.name, (value, key) => {
								var regExp = new RegExp('^' + text);
								if(value.toLowerCase().match(regExp))
									found = true;
							});

							return found;
						}
					},{
						"name.es" : {
					    	$regex: new RegExp('^' + this.getReactively('searchText')),
					    	$options : 'i'
					  	}
					}]
				}).count() / this.getReactively('perPage'));
			}
		});

		//catchEvents
		this.root.$on('confirmUpdateCountry', (event, data) => {
			if(data.accepted)
				this.updateCountry(data.item);
		});

		this.root.$on('createTraductionCountry', (event, data) => {
			this.selectedCountry = data.item;
		});
	}

	removeTraduction(key){
		delete this.selectedCountry.name[key];
	}
	selectCountryToEdit(item){
		this.selectedCountry = angular.copy(item);
	}
	onCreateTraductionCountry(){
		this.root.$broadcast('openPopUp', {
			reason : 'createTraductionCountry',
			text : 'Introduzca el nombre del País y la abreviatura del idioma.',
			item : this.selectedCountry,
			action : 'Crear'
		});
	}

	onUpdateCountry(){
		this.root.$broadcast('openPopUp', {
		    reason : 'confirmUpdateCountry',
		    text : 'Seguro que quiere editar '+this.selectedCountry.name.es+' ?',
		    item : this.selectedCountry,
		    action : 'Actualizar'
		});
	}
	updateCountry(country){
		Meteor.call('updateCountry', country._id, country,
			(error) => {
				console.log(error);
				if (error) {
					console.log('Oops, unable to update the country...');
				} else {
					console.log(country.name.es + ' updated!');
				}
			}
		);
	}
	logout(){
		Accounts.logout();
	}
	changePage(direction){
		if(this.page+direction > 0 && this.page+direction <= this.totalPages)
			this.page += direction;
	}
	toggleSort(){
		this.sort["name.es"] *= -1;
	}
	getNumber(num) {
	    return new Array(num+1);   
	}
};

const name = 'admin';

export default angular.module(name, [
	angularMeteor, 
	PopUp
]).component(name, {
	template,
	controllerAs : name,
	controller : Admin
}).config(config);

function config ($stateProvider) {
	'ngInject';

	$stateProvider
	.state('admin', {
		url:'/admin', 
		template: '<admin></admin>', 
		resolve : {
			currentUser($q){
				Meteor.call('isInRole', 
					(error, response) => {
						if(error){
							return $q.reject('AUTH_REQUIRED');
						} else {
							return $q.resolve();
						}
					}
				);
			}
		}
	});
}

