import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import template from './core.html';
import config from './routes';
import {name as Navigation} from '../navigation/navigation';
import {name as PartiesList} from '../partiesList/partiesList';
import {name as PartyDetails} from '../partyDetails/partyDetails';

class Enantio {};

const name = 'enantio';

export default angular.module(name, [
	angularMeteor, 
	uiRouter,
	Navigation,
	PartiesList,
	PartyDetails
]).component(name, {
	template,
	controllerAs : name,
	controller : Enantio
}).config(config);
