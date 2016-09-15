import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './core.html';
import {name as PartiesList} from '../partiesList/partiesList';

class Enantio {};

const name = 'enantio';

export default angular.module(name, [
	angularMeteor, 
	PartiesList
]).component(name, {
	template,
	controllerAs : name,
	controller : Enantio
});