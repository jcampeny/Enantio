import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import template from './partyAdd.html';
import { Parties } from '../../../api/parties/index';

import { name as AvatarUpload } from '../avatarUpload/avatarUpload';

class PartyAdd {
	constructor(){
		this.party = {};
	}

	submit(){
		this.party.owner = Meteor.user()._id; 
		Parties.insert(this.party);
		this.reset();
	}

	reset() {
		this.party = {};
	}
};

const name = 'partyAdd';

export default angular.module(name, [
	angularMeteor,
	AvatarUpload
]).component(name, {
	template,
	controllerAs : name,
	controller : PartyAdd
});