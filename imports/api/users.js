import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

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

export function isInRole() {
	if(!Roles.userIsInRole(Meteor.user(), 'admin', 'admin-group')){
		throw new Meteor.Error(403, "Access denied");
	} 
		return true;
	
}
 
Meteor.methods({
	isInRole
});