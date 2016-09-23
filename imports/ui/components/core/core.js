import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngMaterial from 'angular-material';
import uiRouter from 'angular-ui-router';

import template from './core.html';
import {name as Navigation} from '../navigation/navigation';

import {name as Auth} from '../auth/auth';
import {name as Home} from '../home/home';

class App {};

const name = 'app';

export default angular.module(name, [
	angularMeteor,
	ngMaterial, 
	Auth,
	Home,
	'accounts.ui',
	Navigation,
	uiRouter

]).component(name, {
	template,
	controllerAs : name,
	controller : App
})
.config(config)
.run(run);

function config($locationProvider, $urlRouterProvider, $stateProvider, $mdIconProvider, $mdThemingProvider) {
	'ngInject';

	$locationProvider.html5Mode(true);

	$urlRouterProvider.otherwise('/');

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


	  $mdThemingProvider.definePalette('enantioPaletteName', {
	    '50': 'ffebee',
	    '100': 'ffcdd2',
	    '200': 'ef9a9a',
	    '300': 'e57373',
	    '400': 'ef5350',
	    '500': '3A4A61', //input bottom color on hover
	    '600': 'e53935',
	    '700': 'd32f2f',
	    '800': 'c62828',
	    '900': 'b71c1c',
	    'A100': 'ff8a80',
	    'A200': 'ff5252',
	    'A400': 'ff1744',
	    'A700': 'd50000',
	    'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
	                                        // on this palette should be dark or light

	    'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
	     '200', '300', '400', 'A100'],
	    'contrastLightColors': undefined    // could also specify this if default was 'dark'
	  });

	  $mdThemingProvider.theme('default')
	    .primaryPalette('enantioPaletteName')
}

function run($rootScope, $state){
	'ngInject';

	$rootScope.$on('$stateChangeError',
		(event, toState, toParams, fromState, fromParams, error) => {
	    	if (error === 'AUTH_REQUIRED') {
	      		$state.go('auth');
	      		console.log('AUTH_REQUIRED');
	    	}
	    	if (error === 'LOGGED') {
	    		$state.go('home.resumen');
	    		console.log('LOGGED');
	    	}
	  	}
	);
}