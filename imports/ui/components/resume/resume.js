import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './resume.html';

import { name as VizHeader } from './vizHeader/vizHeader';
import { name as Importadores } from '../dataviz/importadores/importadores';
import { name as Exportadores } from '../dataviz/exportadores/exportadores';
import { name as VBars } from '../dataviz/vbars/vbars';
import { name as Treemap } from '../dataviz/treemap/treemap';
import { name as Prices } from '../dataviz/prices/prices';

class Resume {
	constructor ($scope, $reactive, $rootScope) {
		'ngInject';

		$reactive(this).attach($scope);
		this.root = $rootScope;

		const refresh = (name) => {
			this.root.$broadcast('refreshMap', {
				mapType : name
			});
		};

		const toggleLock = (name, lock) => {
			this.root.$broadcast('toggleLock', {
				mapType : name,
				toLock : lock
			});
		}

		function headerController (id, name, lock, toggleLock, refresh, fullScreen, collapsed, date = null) {
			this.id = id;
			this.name = name;
			this.lock = lock;
			this.toggleLock = toggleLock;
			this.refresh = refresh;
			this.fullScreen = fullScreen;
			this.collapsed = collapsed;
			this.date = date;

			if(this.lock)
				$(name.toLowerCase()).addClass('locked-area');
		}
		/*new Date().getFullYear()*/
		this.date = {
			start : 2008,
			end : 2015
		};

		this.fecha        = new headerController('fecha', 'Fecha', null, toggleLock, null, 'home.fecha', false, this.date);
		this.importadores = new headerController('importadores', 'Importadores', true, toggleLock, refresh, 'home.importadores', false);
		this.exportadores = new headerController('exportadores', 'Exportadores', true, toggleLock, refresh, 'home.exportadores', false);
		this.codigo       = new headerController('codigo', 'Código de tarifa', null, toggleLock, null, 'home.codigo', false);
		this.precio       = new headerController('precio', 'Precio unitario', true, toggleLock, refresh, 'home.precio', true);
	}

};

const name = 'resume';

export default angular.module(name, [
	angularMeteor,
	VizHeader,
	Importadores,
	Exportadores,
	VBars,
	Treemap,
	Prices
]).component(name, {
	template,
	controllerAs : name,
	controller : Resume
});

