import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './exports.html';

import { name as FiltersService } from '../dataviz/filtersService';
import { name as Importadores } from '../dataviz/importadores/importadores';
import { name as Exportadores } from '../dataviz/exportadores/exportadores';
import { name as VBars } from '../dataviz/vbars/vbars';
import { name as Treemap } from '../dataviz/treemap/treemap';
import { name as Prices } from '../dataviz/prices/prices';

class Exports {
	constructor ($scope, $state, $reactive, $rootScope, filtersService) {
		'ngInject';

		$reactive(this).attach($scope);

		this.root = $rootScope;
		this.state = $state;
		this.filtersService = filtersService;

		let ids = ['fecha', 'importadores', 'exportadores', 'codigo', 'precio'];
		setTimeout(() => {
			ids.map((i)=>this.root.$broadcast('showTable_'+i));
		}, 15000);
		


		this.root.filter = {
			product : {code: '0101', name :{es : 'Product test'}},
			importers : [{iso: '011', name :{es : 'Country importer'}}],
			exporters: [{iso: '022', name :{es : 'Country exporter'}}],
			years : {start: '2005', end:'2015'}
		};

	}
};

const name = 'exports';

export default angular.module(name, [
	angularMeteor,
	Importadores,
	Exportadores,
	VBars,
	Treemap,
	Prices
]).component(name, {
	template,
	controllerAs : name,
	controller : Exports
});
