import { Mongo } from 'meteor/mongo';
import { Roles } from 'meteor/alanning:roles';

export const Countries = new Mongo.Collection('countries');

Countries.allow({
	insert (userId, country) {
		if(!Roles.userIsInRole(userId, 'admin', 'admin-group')){
			return false;
		}
		return true;
	},
	update (userId, country, fields, modifier) {
		if(!Roles.userIsInRole(userId, 'admin', 'admin-group')){
			return false;
		}
		return true;
	},
	remove (userId, country) {
		if(!Roles.userIsInRole(userId, 'admin', 'admin-group')){
			return false;
		}
		return true;
	}
});