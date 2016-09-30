import { Mongo } from 'meteor/mongo';

export const Countries = new Mongo.Collection('countries');

Countries.allow({
	insert (userId, country) {
		return false;
	},
	update (userId, country, fields, modifier) {
		return false;
	},
	remove (userId, country) {
		return false;
	}
});