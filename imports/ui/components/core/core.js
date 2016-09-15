import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import template from './core.html';
import {name as PartiesList} from '../partiesList/partiesList';

class Enantio {};

const name = 'enantio';

export default angular.module(name, [
	angularMeteor, 
	uiRouter,
	PartiesList
]).component(name, {
	template,
	controllerAs : name,
	controller : Enantio
});