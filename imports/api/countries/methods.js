import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

import { Countries } from './collection';
 
export function updateCountry(countryId, newCountryInfo) {

	if (!Roles.userIsInRole(this.userId, 'admin', 'admin-group')) {
	  throw new Meteor.Error(400, 'You have to be Admin!');
	}

	const country = Countries.findOne(countryId);

	if (!country) {
		throw new Meteor.Error(404, 'No such country!');
	}

	let where = {_id : countryId};
	let set = {
		$set : {
			name : newCountryInfo.name
		} 
	};

	Countries.update(where, set);
}
 
Meteor.methods({
	updateCountry
});