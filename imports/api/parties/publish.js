import { Meteor } from 'meteor/meteor';

import { Parties } from './collection';

if (Meteor.isServer) {
	Meteor.publish('parties', function(){
		const selector = {
			$or : [{
				$and : [{
					public : true
				},{
					public : {
						$exists : true
					}
				}]
			},{
				$and : [{
					owner : this.userId
				},{
					owner : {
						$exists : true
					}
				}]
			}]
		};
		return Parties.find(selector);
	});
}