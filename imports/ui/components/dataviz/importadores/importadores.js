import angular from 'angular';
import angularMeteor from 'angular-meteor';
import * as d3geo from "d3-geo";
import * as d3 from "d3";
import * as topojson from "topojson";

import { Meteor } from 'meteor/meteor';

import template from './importadores.html';
import countriesMap from '../world-110m.json';

class Importadores {
	constructor($scope, $reactive){
		'ngInject';

		$reactive(this).attach($scope);

		this.createMap();
		$scope.$watch(
			()=>$(name).width()+$(name).height(), 
			()=>{console.log($(name).width())});	
	}

	createMap(){
	    var projection = d3geo.geoEquirectangular()
	    	.center([0, 0])
		    .scale(150)
		    .rotate([0,0]);

		var path = d3geo.geoPath()
		    .projection(projection);

		var svg = d3.select("importadores").append("svg")
			.attr('width', $(name).width())
			.attr('height', $(name).width() * 0.6);

		//svg > g > path element
		var dPath = svg.append('g');

		//create land
	    dPath.append("path")
	        .datum(topojson.feature(countriesMap, countriesMap.objects.land))
	        .attr("class", "land")
	        .attr("d", path)
	        .attr("id", function(d) {
              return d.properties.name;
            }); 

	    //create countries border
	    dPath.append("path")
	        .datum(topojson.mesh(countriesMap, countriesMap.objects.countries, (a, b)=>{ return a !== b; }))
	        .attr("class", "border")
	        .attr("d", path);

	    //handle function on zoom event
        var zoom = d3.zoom()
            .on("zoom",() => {
	            dPath.attr("transform",
	            	"translate("+ d3.event.transform.x + ", " + d3.event.transform.y +
	            	")scale("+d3.event.transform.k+")");        		
          });

        //set handle function to svg element
        svg.call(zoom);
	}
}

const name = 'importadores';

export default angular.module(name, [
	angularMeteor
]).component(name, {
	template,
	controllerAs : name,
	controller : Importadores 
});