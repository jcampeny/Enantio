import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

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
	}

	logout(){
		Accounts.logout();
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

