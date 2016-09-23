import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import template from './auth.html';
import {name as Login} from '../login/login';
import {name as Register} from '../register/register';

class Auth {
	constructor($scope, $reactive){
		'ngInject';

		$reactive(this).attach($scope);

		this.helpers({
			isLoggedIn(){
				return !!Meteor.userId();
			},
			currentUser(){
				return Meteor.user();
			}
		});

		this.view = {
			state : 'login'
		};
	}

	logout(){
		Accounts.logout();
	}

	toggleView (state) {
		this.view.state = state;
	}
};

const name = 'auth';

export default angular.module(name, [
	angularMeteor,
	Login,
	Register
]).component(name, {
	template,
	controllerAs : name,
	controller : Auth
}).config(config);

function config ($stateProvider) {
	'ngInject';

	$stateProvider
	.state('auth', {
		url:'/auth', 
		template: '<auth></auth>', 
		resolve : {
			currentUser($q){
				if(Meteor.userId() === null){
					return $q.resolve();
				}else{
					return $q.reject('LOGGED');
				}
			}
		}
	});
}
