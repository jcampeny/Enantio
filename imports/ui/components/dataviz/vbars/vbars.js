import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Data } from '../../../../api/data/index';

import * as d3 from "d3";

import { Meteor } from 'meteor/meteor';

import {name as FiltersService} from '../filtersService';

class VBars {
	constructor($scope, $rootScope, $reactive, $q, $timeout, filtersService){
		'ngInject';
		$reactive(this).attach($scope);

		this.root = $rootScope;
		this.q = $q;
		this.filtersService = filtersService;
		this.data 	= [];

		this.elementName = "vbars";
		this.padding = {x:70, y:45};
		this.element = $(this.elementName);
		this.width  = this.element.width() - 2*this.padding.x;
		
		this.xScale = null;
		this.yScale = null;
		this.svg = null;
		self = this;

		this.loadData().then(()=>{
			this.height = parseInt(this.element.css('paddingTop')) - 2*this.padding.y; //Calcular esto después de renderizar el espacio
		  	this.renderChart(); 

			this.renderTimeout;

			$scope.$watch(
				()=>this.element.width() + this.element.height(), 
				()=>{
					$timeout.cancel(this.renderTimeout);
					this.renderTimeout = $timeout(() => { this.refreshChart();},400);
			});     
		});

		this.handleRootEvents();
	}

	refreshChart(){
	  this.width  = this.element.width() - 2*this.padding.x;
	  this.height = parseInt(this.element.css('paddingTop')) - 2*this.padding.y;
	  this.removeChart();
	  this.renderChart(); 
	}

	removeChart(element){
	  this.svg.remove();
	  d3.select("#vbarsTooltip").remove();
	}

	loadData(){
		let deferred = this.q.defer();
		let self = this;
		let min = Infinity;
		let max = -Infinity;

		Meteor.call('dataYears', 
			this.filtersService.product,
    		this.filtersService.importers,
    		this.filtersService.exporters,
    		this.filtersService.aggregateLevel,
    		this.filtersService.years,
	      	(error,result) => {
		        if (error) {
		          console.log(error);
		        } else {
		          	console.log('DataYears arrived!');
		          	self.data = result.sort(function(a,b){
		          		return a._id - b._id;
		          	});
		            deferred.resolve();
		        }
	      	}
	    );
		// d3.request("data/dataset_anual.json")
		//   .mimeType("application/json")
		//   .response(function(xhr) { return JSON.parse(xhr.responseText); })
		//   .get((data) => {
		//   	self.data = data.dataset;
		//     deferred.resolve();
		// });
		return deferred.promise;
	}

	renderChart(){
		let self = this;
		let maxValue = d3.max(this.data, function(d) { return d.total; });	
		var tooltip = d3.select(this.elementName).append('div').attr("class", "chartTooltip").attr("id", "vbarsTooltip");

		this.xScale = d3.scaleBand()
			.domain(this.data.map(function(d) { return d._id; }))
		    .range([0, this.width])
		    .paddingInner(0.6)
		    .paddingOuter(0.8);

		this.yScale = d3.scaleLinear()
			.domain([0, maxValue])
		    .range([this.height, 0]);

		this.svg = d3.select(this.elementName).append("svg")
		  .attr('width', this.width + 2*this.padding.x)
		  .attr('height', this.height + 2*this.padding.y);

		this.svg
			.append("g")
			.attr("transform", "translate(" + this.padding.x + "," + this.padding.y*0.75 + ")")
			.attr("id","vbars")
				.selectAll(".bar")
				    .data(this.data)
				    .enter()
				    .append("rect")
					.attr("class", "bar")
					.attr("x", (d) => { return this.xScale(d._id); })
					.attr("width", this.xScale.bandwidth())
					.attr("y", (d) => { return this.yScale(d.total); })
					.attr("height", (d) => { return this.height - this.yScale(d.total); })
					.on('mouseover', function(d,i){
						// let mouse = d3.mouse(this.svg.node()).map(function(d) {
						// 	return parseInt(d);
						// });
					  
					    let tooltipDif = 0;
					    if(i>0){
					    	tooltipDif = Math.round(((d.total-self.data[i-1].total)/self.data[i-1].total) * 10000)/100;
					    }

					    let tooltipContent = 
					      "<table><tr class='tooltip-item'><td class='item-left'>% Dif: </td><td class='item-right'>"+tooltipDif+"</td></tr>"+
					      "<tr class='tooltip-item'><td class='item-left'>€ Fob: </td><td class='item-right'>"+d.total.toLocaleString()+"</td></tr></table>";


					    let containerWidth = parseInt(self.svg.style("width"));
					    // let tooltipLeft = mouse[0] + parseInt(tooltip.style("width")) < containerWidth ? (mouse[0] + 15) : (mouse[0] - 15 - parseInt(tooltip.style("width")));
					    let tooltipLeft = parseInt(d3.select(this).attr("x")) + (self.xScale.bandwidth() / 2);
					    let tooltipHeight = parseInt(tooltip.style("height")) <= 0 ? 48 : parseInt(tooltip.style("height"));
					    let tooltipTop = parseInt(d3.select(this).attr("y")) - tooltipHeight + self.padding.y;

					    tooltip.classed('show', true)
					        .attr('style', 'left:' + (tooltipLeft) +'px; top:' + (tooltipTop) + 'px')
					        .html(tooltipContent);
					})
					.on('mouseout', function() {
					    tooltip.classed('show', false);
					})
					.on('click',function(d){
						self.filtersService.years = {start:d._id, end:d._id};
						self.root.$broadcast('refreshDBData');
					});

		this.svg.append("g")
		    .attr("transform", "translate(" + this.padding.x + "," + (this.padding.y*0.75 + this.height + (this.padding.y/8)) + ")")
		    .call(d3.axisBottom(this.xScale));

		// add the y Axis

		let tickValues = [0, maxValue/3, 2*maxValue/3, maxValue];
		this.svg.append("g")
			.attr("transform", "translate(" + this.padding.x + "," + this.padding.y*0.75 + ")")
		    .call(d3.axisLeft(this.yScale)
		    		.tickValues(tickValues)
		    		.tickFormat(function(d) { return parseInt(parseFloat(d)/1000000000); }));


		this.svg.append("g")
			.attr("transform", "translate(0," + this.padding.y*0.75 + ")")
			.attr("class","tick-lines")
				.selectAll(".tick-line")
				.data(tickValues)
				.enter()
				.append("rect")
				.attr("class","tick-line")
				.attr("stroke-width",0.5)
				.attr("stroke","#9B9B9B")
				// .attr("x1",this.padding.x)
				// .attr("y1",(d) => { return this.yScale(d); })
				// .attr("x2",this.width+this.padding.x)
				// .attr("y2",(d) => { return this.yScale(d); });
				.attr("x",this.padding.x)
				.attr("y",(d) => { return this.yScale(d) - 1; })
				.attr("width",this.width)
				.attr("height",0.5);


	}

	handleRootEvents(){
		this.root.$on('refreshDBData', (event) => {
	  		this.loadData().then(()=>{
    			this.refreshChart(); 
    		});
		});
	}
}

const name = 'vbars';

export default angular.module(name, [
	angularMeteor,
	FiltersService
]).component(name, {
	controllerAs : name,
	controller : VBars 
});