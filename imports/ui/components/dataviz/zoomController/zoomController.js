import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './zoomController.html';


class ZoomController {
	constructor($scope, $reactive, $rootScope){
		'ngInject';

		$reactive(this).attach($scope);

		this.root = $rootScope;
	}

	zoom(direction){
		this.root.$broadcast('zoom', {
		    watching: this.watching,
		    direction: direction
		});
	}

	lasso(){
		this.root.$broadcast('lasso', {
			watching: this.watching
		})
	}
}

const name = 'zoomController';

export default angular.module(name, [
	angularMeteor
]).component(name, {
	template,
	bindings : {
		watching : '@'
	},
	controllerAs : name,
	controller : ZoomController 
});