import angular from 'angular';
import angularMeteor from 'angular-meteor';
import * as d3geo from "d3-geo";
import * as d3 from "d3";
import * as topojson from "topojson";

import { Meteor } from 'meteor/meteor';

import template from './importadores.html';
import us from './countries_50.json';

class Importadores {
	constructor(){
		

		var width = 960,
		    height = 600;

	    var projection = d3geo.geoMercator()
	    	.center([0, 0])
		    .scale(150)
		    .rotate([0,0]);

		var path = d3geo.geoPath()
		    .projection(projection);

		var svg = d3.select("importadores").append("svg")
		    .attr("width", width)
		    .attr("height", height);

		console.log(d3);

		var dPath = svg.append('g');

	    dPath.append("path")
	        .datum(topojson.feature(us, us.objects.countries_50_geo))
	        .attr("class", "land")
	        .attr("d", path);

	    dPath.append("path")
	        .datum(topojson.mesh(us, us.objects.countries_50_geo, (a, b)=>{ return a !== b; }))
	        .attr("class", "border")
	        .attr("d", path);

        // zoom and pan
        var zoom = d3.zoom()
            .on("zoom",() =>  {
	            dPath.attr("transform",
	            	"translate("+ d3.event.transform.x + ", " + d3.event.transform.y +
	            	")scale("+d3.event.transform.k+")");            		
          });

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