import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

class FiltersService
{
  	constructor(){
  		'ngInject';
  		// $reactive(this).attach($scope);

  		this.product = null;
  		this.importers = [];
  		this.exporters = [];
  		this.years = {start: 2008, end: 2015};
  		this.aggregateLevel = 2;



  	}

  	getFilters(){
  		return{
			product        : this.product,
			importers      : this.importers,
			exporters      : this.exporters,
			years          : this.years,
			aggregateLevel : this.aggregateLevel
  		};
  	}

  	setFilters(filters){
		this.product        = filters.product;
		this.importers      = filters.importers;
		this.exporters      = filters.exporters;
		this.years          = filters.years;
		this.aggregateLevel = filters.aggregateLevel;
  	}

 //  	getProductFilter(){
 //  		return this.product;
 //  	}
	
	// setProductFilter(product){
	// 	this.product = product;
	// }

 //  	getImportersFilter(){
 //  		return this.importers;
 //  	}
	
	// setImportersFilter(importers){
	// 	this.importers = importers;
	// }

 //  	getExportersFilter(){
 //  		return this.exporters;
 //  	}
	
	// setExportersFilter(exporters){
	// 	this.exporters = exporters;
	// }

 //  	getYearFilter(){
 //  		return this.year;
 //  	}
	
	// setYearFilter(year){
	// 	this.year = year;
	// }

 //  	getAggregateFilter(){
 //  		return this.aggregateLevel;
 //  	}
	
	// setAggregateFilter(aggregateLevel){
	// 	this.aggregateLevel = aggregateLevel;
	// }
}

const name = 'filtersService';

export default angular.module(name, [angularMeteor])
	.service(name, FiltersService);
