import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import template from './home.html';

import {name as Navigation} from '../navigation/navigation';
import {name as Resume} from '../resume/resume';
import {name as Favoritos} from '../favoritos/favoritos';
import {name as Exports} from '../exports/exports';
import {name as PopUp} from '../popUp/popUp';

class Home {
	constructor ($scope, $reactive, $rootScope, $state) {
		'ngInject';

		$reactive(this).attach($scope);

		this.root = $rootScope;
		this.state = $state;

		this.root.filter = {
			product : '',
			importers : [''],
			exporters: [''],
			years : {start: '', end:''}
		};

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

	addFavorite (event, menu) {
		event.stopPropagation();
		this.root.$broadcast('toggleMenu', {
		    menu : menu
		});
	}

	scrollToTop () {
		var scrollTop = $('body').scrollTop();
		
		$('html,body').animate({
		    scrollTop: 0
		},  scrollTop / 1.5);
	}
};

const name = 'home';

export default angular.module(name, [
	angularMeteor,
	Navigation,
	Resume,
	Favoritos,
	PopUp,
	Exports
]).component(name, {
	template,
	controllerAs : name,
	controller : Home
}).config(config);

function config ($stateProvider) {
	'ngInject';

	$stateProvider
	.state('home', {
		url:'/', 
		template: '<home></home>', 
		abstract: true,
		resolve : {
			currentUser($q){
				if(Meteor.userId() === null){
					return $q.reject('AUTH_REQUIRED');
				} else {
					return $q.resolve();
				}
			}
		}
	})

	.state('home.resumen', {
		url : '',
		template : '<resume></resume>'
	})

	.state('home.favoritos', {
		url : 'favoritos',
		template : '<favoritos></favoritos>'
	})

	.state('home.exports', {
		url : 'exports',
		template : '<exports></exports>'
	});
}

