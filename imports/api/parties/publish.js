import { Meteor } from 'meteor/meteor';

import { Parties } from './collection';

if (Meteor.isServer) {
	Meteor.publish('parties', function(options, searchString){
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

		if (typeof searchString === 'string' && searchString.length) {
			selector.name = {
		    	$regex: `.*${searchString}.*`,
		    	$options : 'i'
		  	};
		}

		return Parties.find(selector, options);
	});
}