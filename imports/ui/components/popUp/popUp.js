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

		this.root.$on('openPopUp', (event, data) => {
			this.reason = data.reason;
			if(this.reason == 'deleteFavorite'){
				this.content = data.text;
				this.item = data.item;
				this.openPopUp();
			}
		});
	}

	submit (accepted) {
		this.root.$broadcast(this.reason, {
		    item : this.item,
		    accepted
		});
		this.closePopUp();
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

