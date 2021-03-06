import { Meteor } from 'meteor/meteor';
import { Data } from './collection';

export function dataYears(product, importers, exporters, aggregateLevel, years) {
	if (Meteor.isServer){

		let pipeline = [
			{$match: {'$and': getMatch(product, importers, exporters, aggregateLevel, years)}},
			{$group: { _id : "$period", total: { $sum: "$trade_value" } }}
		];

		console.log("DataYears");
		console.log(getMatch(product, importers, exporters, aggregateLevel, years));

		return Data.aggregate(pipeline);
	}
}

export function dataImporters(product, importers, exporters, aggregateLevel, years) {
	if (Meteor.isServer){

		let pipeline = [
			{$match: {'$and': getMatch(product, importers, exporters, aggregateLevel, years, "importers")}},
			{$group: { _id : "$reporter", total: { $sum: "$trade_value" } }}
		];

		console.log("DataImporters");
		console.log(getMatch(product, importers, exporters, aggregateLevel, years, "importers"));

		return Data.aggregate(pipeline);
	}
}

export function dataExporters(product, importers, exporters, aggregateLevel, years) {
	if (Meteor.isServer){

		let pipeline = [
			{$match: {'$and': getMatch(product, importers, exporters, aggregateLevel, years, "exporters")}},
			{$group: { _id : "$reporter", total: { $sum: "$trade_value" } }}
		];

		console.log("DataExporters");
		console.log(getMatch(product, importers, exporters, aggregateLevel, years, "exporters"));

		return Data.aggregate(pipeline);
	}
}

export function dataProducts(product, importers, exporters, aggregateLevel, years) {
	if (Meteor.isServer){

		let pipeline = [
			{$match: {'$and': getMatch(product, importers, exporters, aggregateLevel, years)}},
			{$group: { _id : "$commodity_code", total: { $sum: "$trade_value" }, total_qty:{$sum:'$qty'} }}
		];

		console.log("DataProducts");
		console.log(getMatch(product, importers, exporters, aggregateLevel, years));

		return Data.aggregate(pipeline);
	}
}

export function dataPrices(product, importers, exporters, aggregateLevel, years) {
	if (Meteor.isServer){

		let pipeline = [
			{$match: {'$and': getMatch(product, importers, exporters, aggregateLevel, years)}},
			{$group: { _id : {qty:'$qty',unit:'$qty_unit'}, value_total: { $sum: "$trade_value" }, qty:{$sum:"$qty"},weight:{$sum:"$netweight"} }},
			{$project : {_id:1, qty:1, value_total:1, precio_unit:{$cond: { if: { $ne: [ "$qty", 0 ] }, then: {$divide:["$value_total","$qty"]}, else: 0 }}}},
			{$group: {_id:{precio_unit:'$precio_unit', unit:'$_id.unit'}, value_total:{$sum:'$value_total'}, cantidad:{$sum:'$qty'}}},
			{$sort: {'_id.precio_unit':1}}
		];

		console.log("DataPrices");
		console.log(getMatch(product, importers, exporters, aggregateLevel, years));

		return Data.aggregate(pipeline);
	}
}

function getMatch(product, importers, exporters, aggregateLevel, years, countryOperation){
	let match = [];

	if(typeof product === "string" ){
		match.push({'commodity_code' : {$regex:'^'+product}});
	}


	if(countryOperation === "importers"){
		match.push({'trade_flow' : 1});

		if(typeof importers !== "undefined" && Array.isArray(importers) && importers.length>0){
			match.push({'reporter' : {$in: importers}});

			if(typeof exporters !== "undefined" && Array.isArray(exporters) && exporters.length>0){
				match.push({'partner' : {$in: exporters}});
			}

		}else if(typeof exporters !== "undefined" && Array.isArray(exporters) && exporters.length>0){
			match.push({'partner' : {$in: exporters}});

		}else{
			match.push({'partner' : 0});
		}

	}else if(countryOperation === "exporters"){
		match.push({'trade_flow' : 2});
		
		if(typeof exporters !== "undefined" && Array.isArray(exporters) && exporters.length>0){
			match.push({'reporter' : {$in: exporters}});

			if(typeof importers !== "undefined" && Array.isArray(importers) && importers.length>0){
				match.push({'partner' : {$in: importers}});
			}

		}else if(typeof importers !== "undefined" && Array.isArray(importers) && importers.length>0){
			match.push({'partner' : {$in: importers}});
			
		}else{
			match.push({'partner' : 0});
		}

	}else{
		match.push({'trade_flow' : 1});
		if(typeof importers !== "undefined" && Array.isArray(importers) && importers.length>0){
			match.push({'reporter' : {$in: importers}});
		}
		if(typeof exporters !== "undefined" && Array.isArray(exporters) && exporters.length>0){
			match.push({'partner' : {$in: exporters}});
		}
		if((!importers && !exporters) || (importers.length==0 && exporters.length==0)){
			match.push({'partner' : 0});
		}
	}

	if(typeof aggregateLevel === "undefined"){
		match.push({'aggregate_level' : 2});
	}else{
		match.push({'aggregate_level' : aggregateLevel});
	}

	if(typeof years !== "undefined" && typeof years.start !== "undefined" && typeof years.end !== "undefined"){
		match.push({'period': {'$gte': years.start}})
		match.push({'period': {'$lte': years.end}});
	}

	return match;
}

Meteor.methods({
  dataYears,
  dataImporters,
  dataExporters,
  dataProducts,
  dataPrices
});