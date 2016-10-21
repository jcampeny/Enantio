import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import {name as MapComponent} from '../mapComponent';

import template from './exportadores.html';


class Exportadores {
	constructor($scope, $reactive){
		'ngInject';

		$reactive(this).attach($scope);
		let self = this;
	}
}

const name = 'exportadores';

export default angular.module(name, [
	angularMeteor,
	MapComponent
]).component(name, {
	template,
	controllerAs : name,
	controller : Exportadores 
});