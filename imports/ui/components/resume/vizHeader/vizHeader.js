import angular from 'angular';
import angularMeteor from 'angular-meteor';

import {name as VizHeaderService} from './vizHeaderService';
import {name as DatePicker} from '../datePicker/datePicker'
import template from './vizHeader.html';

class VizHeader {
	constructor ($scope, $reactive, $state, vizHeaderServices, $rootScope) {
		'ngInject';

		$reactive(this).attach($scope);

		this.state = $state;
		this.service = vizHeaderServices;
		this.root = $rootScope;
		this.scope = $scope;
		this.viewFrameState = 'contracted';//expanded, changing

		this.catchEvents();
	}
 
	refresh () {
		this.vizController.refresh(this.vizController.name);
	}

	toggleLock () {
		this.vizController.lock = !this.vizController.lock;
		this.vizController.toggleLock(this.vizController.name, this.vizController.lock);
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
				this.refreshMenu();

				console.log('showTable_'+this.vizController.id);
				this.root.$broadcast('showTable_'+this.vizController.id);
			});
	}
	showTable (){
		console.log('showTable_'+this.vizController.id);
		this.root.$broadcast('showTable_'+this.vizController.id);
	}
	showMapa (){
		this.root.$broadcast('hideTable_'+this.vizController.id);
	}

	contract () {
		this.root.$broadcast('hideTable_'+this.vizController.id);
		this.service.contract(this.vizController.id)
			.then((succes) => {
				this.viewFrameState = succes;
				this.refreshMenu(true);
			});
	}

	catchEvents () {
		this.root.$on('expandViz', (event, data)=>{
			if(data.id == this.vizController.id)
				this.expand();
		});
		this.root.$on('contractViz', (event, data)=>{
			if(data.id == this.vizController.id)
				this.contract();
		});
	}

	refreshMenu(contract){
		const id = (contract) ? '' : this.vizController.id;

		this.root.$broadcast('vizSizeChange', {
			id : id
		});
	}

};

const name = 'vizHeader';

export default angular.module(name, [
	angularMeteor,
	VizHeaderService,
	DatePicker
]).component(name, {
	template,
	bindings : {
		vizController : '='
	},
	controllerAs : name,
	controller : VizHeader
});

