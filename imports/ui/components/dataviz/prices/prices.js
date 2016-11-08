import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import * as d3 from "d3";

import { Data } from '../../../../api/data/index';

import {name as FiltersService} from '../filtersService';
import template from './prices.html';

class Prices {
	constructor($scope, $rootScope, $reactive, $q, $timeout, filtersService){
		'ngInject';
		$reactive(this).attach($scope);

		this.root = $rootScope;
		this.q = $q;
		this.filtersService = filtersService;
		this.data 	= [];
		this.unit_data = {};
		this.units_availables = [];
		this.current_unit = null;
		this.show_range = {ini: 0, end:20};

		this.elementName = "prices";
		this.padding = {x:70, y:45};
		this.element = $(this.elementName);
		this.width  = this.element.width() - 2*this.padding.x;
		
		this.xScale = null;
		this.yScale = null;
		this.svg = null;
		self = this;
		this.renderTimeout;

		$scope.$watch(
			()=>this.element.width() + this.element.height(), 
			()=>{
				$timeout.cancel(this.renderTimeout);
				this.renderTimeout = $timeout(() => { this.refreshChart();},400);
		});   

		$scope.$watch(
			()=>this.current_unit, 
			()=>{
				$timeout.cancel(this.renderTimeout);
				this.renderTimeout = $timeout(() => { this.refreshChart();},400);
		}); 

		$scope.$watch(
			()=>this.show_range.ini, 
			()=>{
				$timeout.cancel(this.renderTimeout);
				this.renderTimeout = $timeout(() => { this.refreshChart();},400);
		});
		$scope.$watch(
			()=>this.show_range.end, 
			()=>{
				$timeout.cancel(this.renderTimeout);
				this.renderTimeout = $timeout(() => { this.refreshChart();},400);
		});         

		this.handleRootEvents();

		this.units = {
			1 : {id:1 , abr: "no", label: "No Quantity"},
			2 : {id:2 , abr: "m2", label: "Metros cuadrados"},
			3 : {id:3 , abr: "KW/h", label: "Energía KW/h"},
			4 : {id:4 , abr: "m", label: "Metros"},
			5 : {id:5 , abr: "#", label: "Items"},
			6 : {id:6 , abr: "pares", label: "Pares"},
			7 : {id:7 , abr: "l", label: "Litros"},
			8 : {id:8 , abr: "kg", label: "Kilogramos"},
			9 : {id:9 , abr: "items x 1000", label: "Miles de items"},
			10: {id:10, abr: "paquetes", label: "Número de paquetes"},
			11: {id:11, abr: "docenas", label: "Docenas"},
			12: {id:12, abr: "m3", label: "Metros cúbicos"},
			13: {id:13, abr: "quilates", label: "Peso en quilates"},
		};
	}

	refreshChart(){
	  this.width  = this.element.width() - 2*this.padding.x;
	  this.height = parseInt(this.element.css('paddingTop')) - 2*this.padding.y - 30;
	  this.removeChart();
	  if(Object.keys(self.unit_data).length > 0){
	  	this.renderChart(); 	
	  }
	}

	removeChart(element){
		if(this.svg !== null){
			this.svg.remove();
		}
		d3.select("#pricesTooltip").remove();
	}

	loadData(){
		let deferred = this.q.defer();

		if(this.filtersService.aggregateLevel > 2){
			let self = this;
			let min = Infinity;
			let max = -Infinity;

			Meteor.call('dataPrices', 
				this.filtersService.product,
	    		this.filtersService.importers,
	    		this.filtersService.exporters,
	    		this.filtersService.aggregateLevel,
	    		this.filtersService.years,
		      	(error,result) => {
			        if (error) {
			          console.log(error);
			        } else {
			          	console.log('DataPrices arrived!');
			          	
			          	angular.forEach(result,function(d,i){
			          		if(d._id.unit > 1){
			          			if(!self.unit_data[d._id.unit]){
			          				self.units_availables.push(self.units[d._id.unit]);
			          				if(d._id.unit > 0){
			          					self.current_unit = self.units[d._id.unit];
			          				}
			          				self.unit_data[d._id.unit] = {};
			          			}

			          			if(!self.unit_data[d._id.unit][d._id.precio_unit]){
			          				self.unit_data[d._id.unit][Math.round(d._id.precio_unit)] = {
			          					cantidad: 0,
			          					value_total: 0,
			          					precio_unit : d._id.precio_unit
			          				};
			          			}

			          			self.unit_data[d._id.unit][Math.round(d._id.precio_unit)].cantidad += d.cantidad;
			          			self.unit_data[d._id.unit][Math.round(d._id.precio_unit)].value_total += d.value_total;
			          			self.unit_data[d._id.unit][Math.round(d._id.precio_unit)].precio_unit = (d._id.precio_unit + self.unit_data[d._id.unit][Math.round(d._id.precio_unit)].precio_unit)/2;
			          		}
			          	});

			          	let i = 0;
			          	for(var k in self.unit_data[self.current_unit.id]){
			          		if(i < 20 && i == self.unit_data[self.current_unit.id].length -1 ){
			          			self.show_range.end = k;
			          		}else if(i==20){
			          			self.show_range.end = k;
			          		}

			          		i++;
			          	}
			          	
			            deferred.resolve();
			        }
		      	}
		    );
		}else{
			deferred.resolve();
		}
		
		return deferred.promise;
	}

	renderChart(){
		let self = this;

		this.data = [];
		let i = 0;
		for(var k in self.unit_data[self.current_unit.id]){
			if( i >= parseInt(this.show_range.ini) && i <= parseInt(this.show_range.end)){
				self.data.push({
					_id: k,
					total: self.unit_data[self.current_unit.id][k].value_total,
					qty: self.unit_data[self.current_unit.id][k].cantidad,
					precio_unit : self.unit_data[self.current_unit.id][k].precio_unit
				});
			}
			i++;
		}
		if(self.data.length <= 0){
			return;
		}

		let maxValue = d3.max(this.data, function(d) { return d.total; });	
		var tooltip = d3.select(this.elementName).append('div').attr("class", "chartTooltip").attr("id", "pricesTooltip");

		this.xScale = d3.scaleBand()
			.domain(this.data.map(function(d) { return d._id; }))
		    .range([0, this.width])
		    .paddingInner(0.6)
		    .paddingOuter(0.8);

		this.yScale = d3.scaleLinear()
			.domain([0, maxValue])
		    .range([this.height, 0]);

		this.svg = d3.select(this.elementName+" .prices-chart").append("svg")
		  .attr('width', this.width + 2*this.padding.x)
		  .attr('height', this.height + 2*this.padding.y);

		this.svg
			.append("g")
			.attr("transform", "translate(" + this.padding.x + "," + this.padding.y*0.75 + ")")
			.attr("id","prices")
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
						let precioRound = Math.round(d.precio_unit*100)/100;
					    let tooltipContent = 
					      "<table><tr class='tooltip-item'><td class='item-left'>€ FOB/"+self.current_unit.abr+": </td><td class='item-right'>"+precioRound+"</td></tr>"+
					      "<tr class='tooltip-item'><td class='item-left'>€: </td><td class='item-right'>"+d.total.toLocaleString()+"</td></tr>"+
					      "<tr class='tooltip-item'><td class='item-left'>"+self.current_unit.label+": </td><td class='item-right'>"+d.qty.toLocaleString()+"</td></tr></table>";


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
		    		.tickFormat(function(d) { return parseInt(parseFloat(d)/1000000); }));


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

const name = 'prices';

export default angular.module(name, [
	angularMeteor,
	FiltersService
]).component(name, {
	template,
	controllerAs : name,
	controller : Prices 
});