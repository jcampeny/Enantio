import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import {name as MapComponent} from '../mapComponent';
import { name as ZoomController } from '../zoomController/zoomController'

import template from './exportadores.html';


class Exportadores {
	constructor($scope, $rootScope, $reactive){
		'ngInject';
		$reactive(this).attach($scope);
		var self = this;
		this.root = $rootScope;

		this.showTable = false;

		this.root.$on('showTable_exportadores', (event) => {
		  self.showTable = true;
		});

		this.root.$on('hideTable_exportadores', (event) => {
		  self.showTable = false;
		});
	}
}

const name = 'exportadores';

export default angular.module(name, [
	angularMeteor,
	MapComponent,
	ZoomController
]).component(name, {
	template,
	controllerAs : name,
	controller : Exportadores 
});