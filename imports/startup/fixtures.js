import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import { Parties } from '../api/parties';
import { Countries } from '../api/countries';
import { Products } from '../api/products';
import { Favorites } from '../api/favorites';

Meteor.startup(() => {
    // const adminUser = {
    //     email : 'superadmin@admin.admin',
    //     password : 'admin1234',
    //     username : 'superadmin',
    //     profile : { name : 'Enantio Admin'}
    // };

    // var id = Accounts.createUser(adminUser);
    // Roles.addUsersToRoles(id, 'admin', 'admin-group');


    if(Favorites.find({}).count() === 0){
    	const newFavorite = {
			owner : '5wBMNXC7LRTKKS8u2',
			date : new Date(),//date
			name : 'Favorito Test',
			color : 'yellow',
			filter : {
				product: "",
				importers: [""],
				exporters: [""],
				years : {start: "", end: ""} 
			}
		};
		Favorites.insert(newFavorite);
    }
});
