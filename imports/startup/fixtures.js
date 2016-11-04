import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import { Parties } from '../api/parties';
import { Countries } from '../api/countries';
import { Products } from '../api/products';

Meteor.startup(() => {
    const adminUser = {
        email : 'admin@admin.admin',
        password : 'admin1234',
        username : 'Admin',
        profile : { name : 'Enantio Admin'}
    };

  //var id = Accounts.createUser(adminUser);
  //Roles.addUsersToRoles(id, 'admin', 'admin-group');
});
