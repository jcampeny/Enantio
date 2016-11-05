import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './popUp.html';

class PopUp {
	constructor ($scope, $reactive, $rootScope) {
		'ngInject';

		$reactive(this).attach($scope);
		
		this.root = $rootScope;

		this.content = "";
		this.reason = "";
		this.item = "";
		this.popUpType = "confirmation";

		this.root.$on('openPopUp', (event, data) => {
			this.reason = data.reason;
			//possible switch
			if(this.reason == 'createTraductionCountry'){
				this.popUpType = 'creation';
			} else {
				this.popUpType = "confirmation";
			}

			this.content = data.text;
			this.item = data.item;
			this.action = data.action || 'Borrar';
			this.openPopUp();				


		});
	}

	submit (accepted) {
		var isValid = true;
		if(this.popUpType == 'creation'){
			if(this.temporalIdioma && this.temporalNombre){
				this.item.name[this.temporalIdioma] = this.temporalNombre;			
			} else {
				isValid = false;
			}
		} 
		if(isValid){
			this.root.$broadcast(this.reason, {
			    item : this.item,
			    accepted
			});
			this.closePopUp();
		}
	}
	openPopUp () {
		$('pop-up').addClass('active');		
	}
	closePopUp () {
		$('pop-up').removeClass('active');
	}

};

const name = 'popUp';

export default angular.module(name, [
	angularMeteor
]).component(name, {
	template,
	controllerAs : name,
	controller : PopUp
});

