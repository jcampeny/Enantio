import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import {name as MapComponent} from '../mapComponent';
import { name as ZoomController } from '../zoomController/zoomController'

import template from './importadores.html';


class Importadores {
	constructor($scope, $reactive){
		'ngInject';
		$reactive(this).attach($scope);
	}
}

const name = 'importadores';

export default angular.module(name, [
	angularMeteor,
	MapComponent,
	ZoomController
]).component(name, {
	template,
	controllerAs : name,
	controller : Importadores 
});