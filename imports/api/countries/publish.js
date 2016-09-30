import { Meteor } from 'meteor/meteor';

import { Countries } from './collection';

if (Meteor.isServer) {
	Meteor.publish('countries', () => {

		return Countries.find({});
	});
}