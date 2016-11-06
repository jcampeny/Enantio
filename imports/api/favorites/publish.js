import { Meteor } from 'meteor/meteor';

import { Favorites } from './collection';

if (Meteor.isServer) {
	Meteor.publish('favorites', function(){
		return Favorites.find({
			$and : [{
				owner : this.userId
			},{
				owner : {
					$exists : true
				}
			}]
		});
	});
}