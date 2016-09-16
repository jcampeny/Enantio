import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import { Meteor } from 'meteor/meteor';

import template from './partyDetails.html';
import { Parties } from '../../../api/parties/index';

class PartyDetails {
	constructor($stateParams, $scope, $reactive){
		'ngInject';

		$reactive(this).attach($scope);

		this.partyId = $stateParams.partyId;

		this.subscribe('parties');
		this.subscribe('users');

		this.helpers({
			party(){
				return Parties.findOne({
					_id: $stateParams.partyId
				});
			},
			users(){
				return Meteor.users.find({});
			}
		});
	}

	save(){
		Meteor.call('updateParty', this.partyId, this.party,
			(error) => {
				if (error) {
					console.log('Oops, unable to update the party...');
				} else {
					console.log(this.party.name + ' updated!');
				}
			}
		);
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
}).config(config);

function config($stateProvider) {
	'ngInject';

	$stateProvider.state('partyDetails', {
		url: '/parties/:partyId', 
		template: '<party-details></party-details>',
		resolve : {
			currentUser($q){
				if(Meteor.userId() === null){
					return $q.reject('AUTH_REQUIRED');
				}else{
					return $q.resolve();
				}
			}
		}
	});


}