
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
//import { Email } from 'meteor/email';

import { Parties } from './collection';
 
export function updateParty(partyId, newInfoParty) {
	check(partyId, String);
	check(newInfoParty.name, String);
	check(newInfoParty.description, String);

	if (!this.userId) {
	  throw new Meteor.Error(400, 'You have to be logged in!');
	}

	const party = Parties.findOne(partyId);

	if (!party) {
		throw new Meteor.Error(404, 'No such party!');
	}

	if (party.owner !== this.userId) {
		throw new Meteor.Error(404, 'No permissions!');
	}

	let where = {_id : partyId};
	let set = {
		$set : {
			name : newInfoParty.name,
			description : newInfoParty.description,
			public : newInfoParty.public
		} 
	};

	Parties.update(where, set);
}
 
Meteor.methods({
	updateParty
});