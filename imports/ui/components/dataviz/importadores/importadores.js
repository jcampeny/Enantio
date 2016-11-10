import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import {name as MapComponent} from '../mapComponent';
import {name as DataTable} from '../dataTable/dataTable';
import { name as ZoomController } from '../zoomController/zoomController';

import template from './importadores.html';


class Importadores {
	constructor($scope, $rootScope, $reactive){
		'ngInject';
		$reactive(this).attach($scope);
		var self = this;
		this.root = $rootScope;

		this.showTable = false;

		this.root.$on('showTable_importadores', (event) => {
		  self.showTable = true;
		});

		this.root.$on('hideTable_importadores', (event) => {
		  self.showTable = false;
		});
	}
}

const name = 'importadores';

export default angular.module(name, [
	angularMeteor,
	MapComponent,
	ZoomController,
	DataTable
]).component(name, {
	template,
	controllerAs : name,
	controller : Importadores 
});