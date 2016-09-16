import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngMaterial from 'angular-material';
import uiRouter from 'angular-ui-router';

import template from './core.html';
import {name as Navigation} from '../navigation/navigation';
import {name as PartiesList} from '../partiesList/partiesList';
import {name as PartyDetails} from '../partyDetails/partyDetails';

class App {};

const name = 'app';

export default angular.module(name, [
	angularMeteor,
	ngMaterial, 
	uiRouter,
	'accounts.ui',
	Navigation,
	PartiesList,
	PartyDetails
]).component(name, {
	template,
	controllerAs : name,
	controller : App
})
.config(config)
.run(run);

function config($locationProvider, $urlRouterProvider, $stateProvider, $mdIconProvider) {
	'ngInject';

	$locationProvider.html5Mode(true);

	$urlRouterProvider.otherwise('/parties');

	//Angular material icons 
	//http://google.github.io/material-design-icons/
	const iconPath =  '/packages/planettraining_material-design-icons/bower_components/material-design-icons/sprites/svg-sprite/';
	
	$mdIconProvider
	  .iconSet('social',
	    iconPath + 'svg-sprite-social.svg')
	  .iconSet('action',
	    iconPath + 'svg-sprite-action.svg')
	  .iconSet('communication',
	    iconPath + 'svg-sprite-communication.svg')
	  .iconSet('content',
	    iconPath + 'svg-sprite-content.svg')
	  .iconSet('toggle',
	    iconPath + 'svg-sprite-toggle.svg')
	  .iconSet('navigation',
	    iconPath + 'svg-sprite-navigation.svg')
	  .iconSet('image',
	    iconPath + 'svg-sprite-image.svg');
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