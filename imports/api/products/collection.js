import { Mongo } from 'meteor/mongo';
import { Roles } from 'meteor/alanning:roles';

export const Products = new Mongo.Collection('products');

Products.allow({
	insert (userId, product) {
		if(!Roles.userIsInRole(userId, 'admin', 'admin-group')){
			return false;
		}
		return true;
	},
	update (userId, product, fields, modifier) {
		if(!Roles.userIsInRole(userId, 'admin', 'admin-group')){
			return false;
		}
		return true;
	},
	remove (userId, product) {
		if(!Roles.userIsInRole(userId, 'admin', 'admin-group')){
			return false;
		}
		return true;
	}
});