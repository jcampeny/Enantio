import { Meteor } from 'meteor/meteor';

import { Data } from './collection';

if (Meteor.isServer) {
	Meteor.publish('dataYears', function(options, product, importers, exporters, aggregateLevel){
		// let match = [];

		// if(typeof product === "string" ){
		// 	match.push({'commodity_code' : product});
		// }

		// if(typeof importers !== "undefined" && Array.isArray(importers) && importers.lenth>0){
		// 	match.push({'trade_flow' : 1});

		// 	if(typeof exporters !== "undefined" && Array.isArray(exporters) && exporters.length>0){
		// 		match.push({'partner' : {$in: [importers.concat(exporters)]}});

		// 	}else{
		// 		match.push({'partner' : {$in: [importers]}});
		// 	}

		// }else if(typeof exporters !== "undefined" && Array.isArray(exporters) && exporters.legnth>0){
		// 	match.push({'trade_flow' : 2});
		// 	match.push({'partner' : {$in: [exporters]}});

		// }else{
		// 	match.push({'trade_flow' : 1});
		// 	match.push({'partner' : 0});
		// }

		// if(typeof aggregateLevel === "undefined"){
		// 	match.push({'aggregate_level' : 2});
		// }else{
		// 	match.push({'aggregate_level' : aggregateLevel});
		// }

		// // console.log(options);
		// // console.log(product);
		// // console.log(importers);
		// // console.log(exporters);
		// // console.log(aggregateLevel);

		// console.log(match);

		// let pipeline = [
		// 	{$match: {'$and': match}},
		// 	{$group: { _id : "$period", total: { $sum: "$trade_value" } }}
		// ];

		// console.log(pipeline);

		// return Data.aggregate(pipeline);
	});

	// Meteor.publish('data', function(options, product, importers, exporters, year, aggregateLevel){
	// 	const selector = {};

	// 	if(typeof product === "string" ){
	// 		selector['Commodity Code'] = product;
	// 	}

	// 	if(typeof importers !== "undefined" && Array.isArray(importers)){
	// 		if(typeof exporters !== "undefined" && Array.isArray(exporters)){
	// 			// selector.flow = {$or:["1","2"]}; //rg
	// 			selector['Reporter Code'] = {$in: [importers.concat(exporters)]};

	// 		}else{
	// 			selector['Trade Flow Code'] = "1"; //rg
	// 			selector['Reporter Code'] = {$in: [importers]};	
	// 		}

	// 	}else if(typeof exporters !== "undefined" && Array.isArray(exporters)){
	// 		selector['Trade Flow Code'] = "2"; //rg
	// 		selector['Reporter Code'] = {$in: [importers]};
	// 	}

	// 	if(typeof year === "string"){
	// 		selector.Period = year;
	// 	}

	// 	if(typeof aggregateLevel === "undefined"){
	// 		selector['Aggregate Level'] = "2";
	// 	}

	// 	console.log(options+"--"+product+"--"+importers+"--"+exporters+"--"+year+"--"+aggregateLevel);
	// 	console.log(selector);

	// 	return Data.find(selector);
	// });
}