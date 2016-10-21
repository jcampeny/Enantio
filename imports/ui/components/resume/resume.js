import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './resume.html';

import { name as VizHeader } from './vizHeader/vizHeader';
import { name as Importadores } from '../dataviz/importadores/importadores';
import { name as Exportadores } from '../dataviz/exportadores/exportadores';


class Resume {
	constructor ($scope, $reactive, $rootScope) {
		'ngInject';

		$reactive(this).attach($scope);
		this.root = $rootScope;

		this.refresh = (name) => {
			this.root.$broadcast('refreshMap', {
				mapType : name
			});
		};

		function headerController (id, name, lock, refresh, fullScreen, collapsed, date = null) {
			this.id = id;
			this.name = name;
			this.lock = lock;
			this.refresh = refresh;
			this.fullScreen = fullScreen;
			this.collapsed = collapsed;
			this.date = date;
		}
		/*new Date().getFullYear()*/
		this.date = {
			start : '2014',
			end : '2016'
		};

		this.fecha        = new headerController('fecha', 'Fecha', null, null, 'home.fecha', false, this.date);
		this.importadores = new headerController('importadores', 'Importadores', true, this.refresh, 'home.importadores', false);
		this.exportadores = new headerController('exportadores', 'Exportadores', true, this.refresh, 'home.exportadores', false);
		this.codigo       = new headerController('codigo', 'Código de tarifa', null, null, 'home.codigo', false);
		this.precio       = new headerController('precio', 'Precio unitario', true, this.refresh, 'home.precio', true);
	}

};

const name = 'resume';

export default angular.module(name, [
	angularMeteor,
	VizHeader,
	Importadores,
	Exportadores
]).component(name, {
	template,
	controllerAs : name,
	controller : Resume
});

