import angular from 'angular';
import angularMeteor from 'angular-meteor';
import matchMedia from 'angular-media-queries';

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import template from './navigation.html';

import { name as NavigationInputs } from '../navigationInputs/navigationInputs';
import { name as NavMenu } from '../navMenu/navMenu';

class Navigation {
	constructor ($scope, $reactive, $rootScope, screenSize, $state, $rootScope) {
		'ngInject';

		$reactive(this).attach($scope);

		this.state = $state.name;
		this.root = $rootScope;

		this.helpers({
			currentUser(){
				return Meteor.user();
			}
		});

		$rootScope.$on('$stateChangeSuccess',
			(event, toState, toParams, fromState, fromParams) => {
				this.state = toState.name;
		  	}
		);

		this.isMobile = screenSize.is('xs, sm');
		this.isDesktop = !screenSize.is('xs, sm');

		screenSize.on('xs, sm',(match) =>{
		    this.onResize(match);
		});
	}

	onResize (match){
		this.isDesktop = !match;
		this.isMobile = match;
	}

	logout (){
		Accounts.logout();
	}

	toggleMenu (event, menu) {
		event.stopPropagation();
		this.root.$broadcast('toggleMenu', {
		    menu : menu
		});
	}
};

const name = 'navigation';

export default angular.module(name, [
	angularMeteor,
	'matchMedia',
	NavigationInputs,
	NavMenu
]).component(name, {
	template,
	controllerAs : name,
	controller : Navigation
});

