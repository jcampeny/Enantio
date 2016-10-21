import { Mongo } from 'meteor/mongo';

export const Products = new Mongo.Collection('products');

Products.allow({
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