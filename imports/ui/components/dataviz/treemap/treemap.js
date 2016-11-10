import angular from 'angular';
import angularMeteor from 'angular-meteor';

// import {name as FormatService} from './formatService';

import * as d3 from "d3";

import { Meteor } from 'meteor/meteor';

import {name as FiltersService} from '../filtersService';
import {name as DataTableService} from '../dataTableService';
import {name as DataTable} from '../dataTable/dataTable';

import { Products } from '../../../../api/products/index';

import template from './treemap.html';

class Treemap {
	constructor($scope, $rootScope, $reactive, $q, $timeout, filtersService, dataTableService){
		'ngInject';
		$reactive(this).attach($scope);

		this.q = $q;
		this.filtersService = filtersService;
		this.dataTableService = dataTableService;
		this.root = $rootScope;

		this.elementName = "treemap-chart";
		this.element = $(this.elementName);
		this.width  = this.element.width();
		
		this.data 	= [];
		this.nest = null;
		this.svg = null;
		var self = this;

		// Guardar esto que está interesante
		// var format = d3.formatLocale({
		//   decimal: ".",
		//   thousands: ",",
		//   grouping: [3],
		//   currency: ["£", ""]
		// }).format("$,d");

		this.nest = d3.nest()
	  	    .key(function(d) { return d._id; })
	  	    // .key(function(d) { return d.Destination; })
	  	    // .key(function(d) { return d.Ticket_class_description; })
	  	    .rollup(function(d) { return d3.sum(d, function(d) { return d.total; }); });

	  	this.treemap = null;

	  	this.subscribe('products',function(){return [];},{
	  		onReady: () => {
	  	      this.loadData(this.type).then(()=>{
	  	      	self.height = parseInt(self.element.css('paddingTop')); //Calcular esto después de renderizar el espacio
	  	        self.renderChart(); 
	  	        setWatch();  
	  	      });
	  	    }
	  	});

	  	self.renderTimeout;
	  	function setWatch(){
	  		$scope.$watch(
	  			function(){
	  				return self.element.width() + self.element.height();
	  			},
	  			()=>{
	  				$timeout.cancel(self.renderTimeout);
	  				self.renderTimeout = $timeout(() => { 
	  					self.width  = self.element.width();
	  					self.height = parseInt(self.element.css('paddingTop'));
	  					self.refreshChart();
	  				},400);
	  		});   
	  	}

	  	this.showTable = false;

	  	this.root.$on('showTable_codigo', (event) => {
	  	  self.showTable = true;
	  	});

	  	this.root.$on('hideTable_codigo', (event) => {
	  	  self.showTable = false;
	  	});

	  	this.handleRootEvents();
	}

	refreshChart(){
		this.removeChart();
		this.renderChart(); 
	}

	removeChart(element){
		d3.select(this.elementName)
		    .selectAll(".node")
		    .remove();
		d3.select("#treeTooltip").remove();
	}

	loadData(){
		let deferred = this.q.defer();
		let self = this;
		let min = Infinity;
		let max = -Infinity;

		Meteor.call('dataProducts', 
			this.filtersService.product,
    		this.filtersService.importers,
    		this.filtersService.exporters,
    		this.filtersService.aggregateLevel,
    		this.filtersService.years,
	      	(error,result) => {
		        if (error) {
		          console.log(error);
		        } else {
		          	console.log('DataProducts arrived!');
		          	self.data = result;
		          	self.data.sort(function(a,b){ return b.total - a.total});
		          	angular.forEach(self.data, function(d){
		          		let product = Products.findOne({code: d._id});
		          		if(product){
		          			d.desc =  product.name.es;
		          		}
		          	});
		          	self.dataTableService.setData("codigo",{data:self.data});
		            deferred.resolve();
		        }
	      	}
	    );
		return deferred.promise;
	}

	renderChart(){
		let self = this;
		let maxValue = d3.max(this.data, function(d) { return d.total; });	
		let totalValue = d3.sum(this.data, function(d) { return parseFloat(d.total); });	
		var tooltip = d3.select(this.elementName).append('div').attr("class", "chartTooltip").attr("id","treeTooltip");

	  	this.treemap = d3.treemap()
		    .size([this.width, this.height])
		    .padding(0)
		    .round(true);

		let rootH = d3.hierarchy({values: this.nest.entries(this.data)}, function(d) { return d.values; })
		      .sum(function(d) { return d.value; })
		      .sort(function(a, b) { return b.value - a.value; });
		this.treemap(rootH);

		let node = d3.select(this.elementName)
		    .selectAll(".node")
		    .data(rootH.leaves())
		    .enter().append("div")
		    	.attr("id",function(d){ return "node-"+d.data.key; })
				.attr("class", function(d){ 
					if(d.data.key){
						return "node color-"+d.data.key.substring(0,1)+" subcolor-"+d.data.key.substring(1,2);	
					}
				})
				.style("left", function(d) { return d.x0 + "px"; })
				.style("top", function(d) { return d.y0 + "px"; })
				.style("width", function(d) { return d.x1 - d.x0 + "px"; })
				.style("height", function(d) { return d.y1 - d.y0 + "px"; })
				.on('mouseover', function(d,i){
					// let mouse = d3.mouse(this.svg.node()).map(function(d) {
					// 	return parseInt(d);
					// });
				  	
		  			let productName = "";
		  			if(d.data.desc && d.data.desc > 15){
		  				productName = d.data.desc.substring(0,15).trim()+"...";
		  			}

		  		  	let tooltipContent = 
			  		    "<table><tr class='tooltip-item'><td class='item-left'>Alias: </td><td class='item-right'>"+productName+"</td></tr>"+
			  		    "<tr class='tooltip-item'><td class='item-left'>Código NC: </td><td class='item-right'>"+d.data.key+"</td></tr>"+
			  		    "<tr class='tooltip-item'><td class='item-left'>Descripción: </td><td class='item-right'>"+productName+"</td></tr>"+
			  		    "<tr class='tooltip-item'><td class='item-left'>% of total: </td><td class='item-right'>"+(Math.round(parseFloat(d.data.value)/totalValue * 10000) / 100)+"%</td></tr>"+
			  		    "<tr class='tooltip-item'><td class='item-left'>€ Fob: </td><td class='item-right'>"+d.data.value.toLocaleString()+"</td></tr></table>";

			  		let containerWidth = parseInt($(this).width());
			  		let tooltipHeight = parseInt(tooltip.style("height")) <= 0 ? 130 : parseInt(tooltip.style("height"));
			  		let tooltipWdith = parseInt(tooltip.style("width")) <= 0 ? 200 : parseInt(tooltip.style("width"));

			  		let tooltipLeft = parseInt($(this).css("left")) + (parseInt($(this).css("width")) / 2 - (tooltipWdith/2));
		  		    let tooltipTop = parseInt($(this).css("top")) - tooltipHeight;

		  		    tooltip
		  		    	.attr('style', 'left:' + (tooltipLeft) +'px; top:' + (tooltipTop) + 'px; transform:translate(0,20px)')
		  		     	.html(tooltipContent);

		  		  	tooltip.classed('show', true);
				  	
				})
				.on('mouseout', function() {
				    tooltip.classed('show', false);
				})
				.on('click',(d) => {
					if(self.filtersService.aggregateLevel < 6){
						self.filtersService.aggregateLevel = self.filtersService.aggregateLevel+2;
						self.filtersService.product = d.data.key;
						self.root.$broadcast('refreshDBData');	
					}
					
				});

		  	node.append("div")
		      	.attr("class", "node-label")
		      	.text(function(d) { 
		      		if($("#node-"+d.data.key).width() >= 65 && $("#node-"+d.data.key).height() >= 35){
		      			return d.data.key; 	
		      		}else{
		      			return "";
		      		}
		      	});

		  	node.append("div")
		      	.attr("class", "node-value")
		      	.text(function(d) { 
			      	if($("#node-"+d.data.key).width() >= 65 && $("#node-"+d.data.key).height() >= 35){
			      		let product = Products.findOne({code: d.data.key.toString()});
			      		if(product){
			      			return product.name.es; 	
			      		}	
			      	}
			      	return "";		      	
		      	});

	}

	handleRootEvents(){
		this.root.$on('refreshDBData', (event) => {
	  		this.loadData().then(()=>{
    			this.refreshChart(); 
    		});
		});
	}
}

const name = 'treemap';

export default angular.module(name, [
	angularMeteor,
	DataTableService,
	DataTable
]).component(name, {
	template,
	controllerAs : name,
	controller : Treemap 
});