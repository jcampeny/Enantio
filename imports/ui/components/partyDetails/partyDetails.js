import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import template from './partyDetails.html';
import { Parties } from '../../../api/parties';

class PartyDetails {
	constructor($stateParams, $scope, $reactive){
		'ngInject';

		$reactive(this).attach($scope);

		this.partyId = $stateParams.partyId;

		this.helpers({
			party(){
				return Parties.findOne({
					_id: $stateParams.partyId
				});
			}
		});
	}

	save(){
		let where = {_id : this.partyId};
		let set = {
			$set : {
				name : this.party.name,
				description : this.party.description
			} 
		};
		let error = (error) => {
      		if (error) {
        		console.log('Oops, unable to update the party...');
      		} else {
        		console.log(this.party.name + ' updated!');
      	}};

		Parties.update(where, set, error);
	}
};

const name = 'partyDetails';

export default angular.module(name, [
	angularMeteor,
	uiRouter,
]).component(name, {
	template,
	controllerAs : name,
	controller : PartyDetails
});