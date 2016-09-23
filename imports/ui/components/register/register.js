import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import { Accounts } from 'meteor/accounts-base';

import template from './register.html';

class Register {
	constructor ($scope, $reactive, $state) {
		'ngInject';

		this.$state = $state;

		$reactive(this).attach($scope);

		this.subscribe('users');

		this.credentials = {
			email : '',
			password : '',
			profile : '',
			username : ''
		};

		this.helpers({
			searchUsername () {
				return Meteor.users.findOne({
					username : this.getReactively('credentials.username')
				});
			}
		});

		this.error = '';
	}

	register () {
		if (this.usernameValidator()) {
			Accounts.createUser(this.credentials,
				this.$bindToContext((err) => {
					if (err) {
						this.error = err;
					} else {
						this.$state.go('home');
					}
				})
			);
		}console.log(this.error);
	}

	toggleView (state) {
		this.view({
		  newState: state
		});
	}

	usernameValidator () {
		if (!this.credentials.username) {
			this.error = {
				reason : 'Username field is empty'
			};
			return false;
		} else if (this.credentials.username.length < 3) {
			this.error = {
				reason : 'Username is too short'
			};
			return false;
		} else if (this.searchUsername){
			this.error = {
				reason : 'Username already exist'
			};
			return false;
		} else {
			return true;
		}
	}
};

const name = 'register';

export default angular.module(name, [
	angularMeteor,
	uiRouter
]).component(name, {
	template,
	bindings : {
		view : '&'
	},
	controllerAs : name,
	controller : Register
});

