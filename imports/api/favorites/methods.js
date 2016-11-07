import { Meteor } from 'meteor/meteor';

import { Favorites } from './collection';
 
export function insertFavorite(newFavorite) {

	if (!this.userId) {
		throw new Meteor.Error(400, 'Tienes que estar identicado');
	}

	if(newFavorite.owner !== this.userId){
		throw new Meteor.Error(400, 'Invalid id for this favorite');
	}

	const favoriteRepeated = Favorites.find({
		name : newFavorite.name,
		owner : this.userId
	}).count();

	if(favoriteRepeated > 0){
		throw new Meteor.Error(400, 'Esta nombre ya existe');
	}

	Favorites.insert(newFavorite);
}

export function removeFavorite(favoriteId){
	if (!this.userId) {
		throw new Meteor.Error(400, 'You have to be logged in!');
	}

	const favorite = Favorites.findOne(favoriteId);

	if(favorite.owner !== this.userId){
		throw new Meteor.Error(400, 'No permissions to delete!');
	}

	Favorites.remove({"_id" : favorite._id});
}

Meteor.methods({
	insertFavorite,
	removeFavorite
});