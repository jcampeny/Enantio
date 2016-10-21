import { Meteor } from 'meteor/meteor';

import { Products } from './collection';

if (Meteor.isServer) {
	Meteor.publish('products', () => {

		return Products.find({});
	});
}