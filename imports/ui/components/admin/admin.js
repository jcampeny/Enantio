import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import { Countries } from '../../../api/countries/index';

import template from './admin.html';

class Admin {
	constructor ($scope, $reactive, $rootScope, $state) {
		'ngInject';

		$reactive(this).attach($scope);

		this.root = $rootScope;
		this.state = $state;

		this.root.isAdmin = false;

		Meteor.call('isInRole', 
			(error, response) => {
				this.root.isAdmin = response;
			}
		);

		this.perPageOptions = [5, 10, 15, 20, 25];
		this.perPage = 5;
		this.page = 1;
		this.sort = {
			"name.es" : -1
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
	angularMeteor
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

