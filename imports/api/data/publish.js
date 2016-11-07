import { Meteor } from 'meteor/meteor';

import { Data } from './collection';

if (Meteor.isServer) {
	Meteor.publish('data', function(options, product, importers, exporters, year, aggregateLevel){
		const selector = {};

		if(typeof product === "string" ){
			selector['Commodity Code'] = product;
		}

		if(typeof importers !== "undefined" && Array.isArray(importers)){
			if(typeof exporters !== "undefined" && Array.isArray(exporters)){
				// selector.flow = {$or:["1","2"]}; //rg
				selector['Reporter Code'] = {$in: [importers.concat(exporters)]};

			}else{
				selector['Trade Flow Code'] = "1"; //rg
				selector['Reporter Code'] = {$in: [importers]};	
			}

		}else if(typeof exporters !== "undefined" && Array.isArray(exporters)){
			selector['Trade Flow Code'] = "2"; //rg
			selector['Reporter Code'] = {$in: [importers]};
		}

		if(typeof year === "string"){
			selector.Period = year;
		}

		if(typeof aggregateLevel === "undefined"){
			selector['Aggregate Level'] = "2";
		}

		console.log(options+"--"+product+"--"+importers+"--"+exporters+"--"+year+"--"+aggregateLevel);
		console.log(selector);

		return Data.find(selector);
	});
}