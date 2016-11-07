import { Mongo } from 'meteor/mongo';

export const Data = new Mongo.Collection('data');

Data.allow({
	insert (userId, products) {
		return false;
	},
	update (userId, products, fields, modifier) {
		return false;
	},
	remove (userId, products) {
		return false;
	}
});