import angular from 'angular';
import angularMeteor from 'angular-meteor';

import {name as VizHeaderService} from './vizHeaderService';

import template from './vizHeader.html';

class VizHeader {
	constructor ($scope, $reactive, $state, vizHeaderServices) {
		'ngInject';

		$reactive(this).attach($scope);

		this.state = $state;
		this.service = vizHeaderServices;
		
		this.viewFrameState = 'contracted';//expanded, changing
	}
 
	refresh () {
		this.vizController.refresh(this.vizController.name);
	}

	changeViewFrame () {
		if(this.viewFrameState != 'changing'){
			
			if(this.viewFrameState == 'contracted'){
				this.expand();
			} else {
				this.contract();
			}

			this.viewFrameState = 'changing';
		}
	}
	expand () {
		this.service.expand(this.vizController.id)
			.then((succes) => {
				this.viewFrameState = succes;
			});
	}

	contract () {
		this.service.contract(this.vizController.id)
			.then((succes) => {
				this.viewFrameState = succes;
			});
	}

};

const name = 'vizHeader';

export default angular.module(name, [
	angularMeteor,
	VizHeaderService
]).component(name, {
	template,
	bindings : {
		vizController : '='
	},
	controllerAs : name,
	controller : VizHeader
});

