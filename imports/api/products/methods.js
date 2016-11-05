import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

import { Products } from './collection';
 
export function updateProduct(productId, newProductInfo) {

	if (!Roles.userIsInRole(this.userId, 'admin', 'admin-group')) {
	  throw new Meteor.Error(400, 'You have to be Admin!');
	}

	const product = Products.findOne(productId);

	if (!product) {
		throw new Meteor.Error(404, 'No such product!');
	}

	let where = {_id : productId};
	let set = {
		$set : {
			name : newProductInfo.name
		} 
	};

	Products.update(where, set);
}
 
Meteor.methods({
	updateProduct
});