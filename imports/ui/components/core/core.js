import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import template from './core.html';
import {name as Navigation} from '../navigation/navigation';
import {name as PartiesList} from '../partiesList/partiesList';
import {name as PartyDetails} from '../partyDetails/partyDetails';

class Enantio {};

const name = 'enantio';

export default angular.module(name, [
	angularMeteor, 
	uiRouter,
	'accounts.ui',
	Navigation,
	PartiesList,
	PartyDetails
]).component(name, {
	template,
	controllerAs : name,
	controller : Enantio
})
.config(config)
.run(run);

function config($locationProvider, $urlRouterProvider, $stateProvider) {
	'ngInject';

	$locationProvider.html5Mode(true);

	$urlRouterProvider.otherwise('/parties');
}

function run($rootScope, $state){
	'ngInject';
	
	$rootScope.$on('$stateChangeError',
		(event, toState, toParams, fromState, fromParams, error) => {
	    	if (error === 'AUTH_REQUIRED') {
	      		$state.go('parties');
	      		console.log('AUTH_REQUIRED');
	    	}
	  	}
	);
}