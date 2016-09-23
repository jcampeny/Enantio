import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
if (Meteor.isServer) {
	Meteor.publish('users', function(){
		return Meteor.users.find({},{
			fields : {
				email : 1,
				profile : 1,
				username : 1
			}
		});
	});

	Accounts.onCreateUser( (options, user) => {
		if(options.username){
			user.profile = options.profile;
			user.username = options.username;
		}
		return user;
	});
}