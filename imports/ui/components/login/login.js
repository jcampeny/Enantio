import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import { Meteor } from 'meteor/meteor';

import template from './login.html';

import { name as Register } from '../register/register';

class Login {
	constructor ($scope, $reactive, $state) {
		'ngInject';

		this.$state = $state;

		$reactive(this).attach($scope);

		this.credentials = {
			email : '',
			password : ''
		};

		this.error = '';
	}

	login () {
		Meteor.loginWithPassword(this.credentials.email, this.credentials.password,
			this.$bindToContext((err) => {
				if (err) {
					this.error = err;
				} else {
					this.$state.go('home.resumen');
				}
			})
		);
	}

	toggleView (state) {
		this.view({
		  newState: state
		});
	}
};

const name = 'login';

export default angular.module(name, [
	angularMeteor,
	uiRouter
]).component(name, {
	template,
	bindings : {
		view : '&'
	},
	controllerAs : name,
	controller : Login
});
