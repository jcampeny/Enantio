import * as d3geo from "d3-geo";
import * as d3 from "d3";
import * as topojson from "topojson";
import countriesMap from './countries_110.json';

import { Countries } from '../../../api/countries/index';
import {name as FiltersService} from './filtersService';
import {name as DataTableService} from './dataTableService';

class MapComponent
{
	constructor($reactive, $scope, $q, $timeout, $rootScope, filtersService, dataTableService){
		'ngInject';

    $reactive(this).attach($scope);
    
    this.root = $rootScope;
    this.filtersService = filtersService;
    this.dataTableService = dataTableService;
    this.q = $q;
    this.element = $(this.type);

    this.projection = null;
    this.path       = null;
    this.svg        = null;
    this.data       = [];
    this.dataNest   = {};
    this.valueScale = null;
    this.width      = this.element.width();
    this.height     = this.element.height();
    this.totalValue = 0;
    this.currentZoom = 1;

    this.setupMap(this.width, this.width*0.6);
    var self = this;

    var subscriptionHandle = this.subscribe('countries', () => [], {
        onReady: () => {
          self.loadData(self.type).then(()=>{
            self.renderMap(self.type, self.width); 

            self.renderTimeout;

            $scope.$watch(
              ()=>self.element.width() + self.element.height(), 
              ()=>{
                $timeout.cancel(self.renderTimeout);
                self.renderTimeout = $timeout(() => { self.refreshMap(); },400);
              });     
          });
        }
      });
    this.helpers({
      countries(){
        return Countries.find({});
      }
    });

    this.handleRootEvents();
	}

  refreshMap(){
    this.width      = this.element.width();
    this.height     = this.element.height();
    this.setupMap(this.width, this.width * 0.6);
    this.removeMap();
    this.renderMap(this.type, this.width);               
  }

  setupMap(width, height){
    var b = [-180,-90,180,90];
    t = [(b[0]+b[2])/2, (b[1]+b[3])/2];
    s = 0.95 / Math.max((b[2] - b[0]) / width,(b[3] - b[1]) / height);
    s = s * 60;

    this.projection = d3geo.geoMercator()
      .scale(s)
      .center(t)
      .translate([width / 2, height / 1.6]);

    this.path = d3geo.geoPath()
      .projection(this.projection);
  }

  removeMap(element){
    this.svg.remove();
    d3.select("#mapTooltip"+this.type).remove();
  }

  loadData(type){
    let deferred = this.q.defer();
    let self = this;
    // let parser = d3.dsvFormat(";");
    var min = Infinity;
    var max = -Infinity;
    self.totalValue = 0;
    this.dataNest   = {};

    let methodName = "";
    if(this.type === "importadores"){
        methodName = "dataImporters";
    }else if(this.type === "exportadores"){
        methodName = "dataExporters";
    }
    
    Meteor.call(methodName, 
        this.filtersService.product,
        this.filtersService.importers,
        this.filtersService.exporters,
        this.filtersService.aggregateLevel,
        this.filtersService.years,
          (error,result) => {
            if (error) {
              console.log(error);
            } else {
                console.log(methodName+" arrived!");

                let dataTable = {
                  data: []
                };

                angular.forEach(result, (d) => {
                    let country = self.getCountryFromCode(d._id);
                    if(country !== null && !self.dataNest[country.iso]){
                      self.dataNest[country.iso] = { 
                        countryName : country.name.es,
                        total : d.total
                      };
                      dataTable.data.push({countryName : country.name.es, total : d.total});
                    }
                    min = Math.min(min, parseFloat(d.total));
                    max = Math.max(max, parseFloat(d.total));
                    self.totalValue += parseFloat(d.total);
                });

                dataTable.total = self.totalValue;
                dataTable.data.sort(function(a,b){
                  return b.total - a.total;
                });
                self.dataTableService.setData(this.type, dataTable);

                if(min == max){
                  min = min/2;
                }
                self.valueScale = d3.scaleLinear()
                  .domain([min, max])
                  .range([1, 15]);
                deferred.resolve();
            }
          }
        );
      return deferred.promise;
  }
	
  renderMap(element, width){
    var self = this;
    var height = width * 0.6;
    this.svg = d3.select(element).append("svg")
      .attr('width', width)
      .attr('height', height);

    let dPath = this.svg.append('g').attr("id","mapFeatures");
    let circles = this.svg.append('g').attr("id","mapCircles");

    let tooltip = d3.select(this.type).append('div').attr("class", "chartTooltip").attr("id", "mapTooltip"+this.type);

    let dataFeatures = topojson.feature(countriesMap, countriesMap.objects.countries_110_geo).features;

    dPath.selectAll('.land')
        .data(dataFeatures, function(d){
          return d.properties.iso_a3;
        })
        .enter()
        .append("path")
        .attr("class", "land")
        .attr("d", this.path)
        .attr("id", function(d) {
          return d.properties.iso_a3;
        })
        .attr("fill","#e8e8e8")
        .attr("stroke-width","0.5")
        .attr("stroke","#FFFFFF");

    circles.selectAll('.circle')
        .data(dataFeatures, function(d){
          return d.properties.iso_a3;
        })
        .enter()
        .append("circle")
        .attr("class", "circle")

        .attr("id", function(d) {
          return 'circle_'+d.properties.iso_a3;
        })
        .attr("transform", (d) => {
          let country = self.getCountryFromIso(d.properties.iso_a3);
          if(country !== null && country.coordinates.lng && country.coordinates.lat){
            let point = [country.coordinates.lng, country.coordinates.lat];
            return "translate(" + self.projection(point) + ")";   
          }
          
        })
        .attr("r",0)
        .attr("fill",(d)=>{
          if(this.type === "importadores"){
            return "rgb(0,51,123)";
          }else if(this.type === "exportadores"){
            return "rgb(237,27,82)";
          }
        })
        .style("opacity","0.5")
        .on('mousemove', (d)=>{
          var mouse = d3.mouse(this.svg.node()).map(function(d) {
              return parseInt(d);
          });
          var country = self.dataNest[d.properties.iso_a3];
          if(country){
            var tooltipText = "";
            if(this.type === "importadores"){
              tooltipText = "País de destino";

            }else if(this.type === "exportadores"){
              tooltipText = "País de origen";
            }

            var tooltipPercent = Math.round(parseFloat(self.dataNest[d.properties.iso_a3].total / self.totalValue) * 10000) / 100;

            var tooltipContent = 
              "<table><tr class='tooltip-item'><td class='item-left'>"+tooltipText+": </td><td class='item-right'>"+country.countryName+"</td></tr>"+
              "<tr class='tooltip-item'><td class='item-left'>% del total: </td><td class='item-right'>"+tooltipPercent+"%</td></tr></table>";


            var mapWidth = parseInt(this.svg.style("width"));
            var tooltipLeft = mouse[0] + parseInt(tooltip.style("width")) < mapWidth ? (mouse[0] + 15) : (mouse[0] - 15 - parseInt(tooltip.style("width")));

            tooltip.classed('show', true)
                .attr('style', 'left:' + (tooltipLeft) +
                        'px; top:' + (mouse[1] - 35) + 'px')
                .html(tooltipContent);
          }
        })
        .on('mouseout', function() {
            tooltip.classed('show', false);
        })
        .on('click',(d) => {
          if(self.type === "importadores"){
            self.filtersService.importers = [self.getCountryFromIso(d.properties.iso_a3).code];
            self.root.$broadcast('refreshDBData');

          }else if(self.type === "exportadores"){
            self.filtersService.exporters = [self.getCountryFromIso(d.properties.iso_a3).code];
            self.root.$broadcast('refreshDBData');
          }
        })
        .transition()
        .duration(1000)
        .attr("r",(d) => {
          if(self.dataNest[d.properties.iso_a3]){
            return this.valueScale(self.dataNest[d.properties.iso_a3].total);  
          }else{
            return 0;
          }
        });

    this.zoom = d3.zoom()
        .scaleExtent([1, 8])
        // .translateExtent([[0,0],[180,180]])
        .on("zoom",() => {
          var s = d3.event.transform.k;
          var t = [d3.event.transform.x, d3.event.transform.y];

          if(t[0] > width / 2){t[0] = width / 2;}
          if(t[0] < -1 * (width * s * 1.3)){t[0] = -1 * (width * s *1.3);}

          if(t[1] > height / 2){t[1] = height / 2;}
          if(t[1] < -1 * (height / 2) * s * 1.3){t[1] = -1 * (height / 2) * s * 1.3;}       

          d3.selectAll('.land').style("stroke-width", 0.5 / s + "px");
          dPath.attr("transform","translate("+ t[0] + ", " + t[1] + ")scale("+s+")");            
          circles.attr("transform","translate("+ t[0] + ", " + t[1] + ")scale("+s+")");

          circles.selectAll(".circle")
            .data(dataFeatures, function(d){
              return d.properties.iso_a3;
            })
            .attr("r",(d) => {
                if(self.dataNest[d.properties.iso_a3]){
                  return (1/s) * this.valueScale(self.dataNest[d.properties.iso_a3].total);  
                }else{
                  return 0;
                }
            });

      });

    //set handle function to this.svg element
    this.svg.call(this.zoom);
  }

  zoomIn(){
    if(this.currentZoom < 8){
      this.currentZoom++
      this.zoom.scaleTo(this.svg.transition().duration(400), this.currentZoom);   
    }
  }

  zoomOut(){
    if(this.currentZoom >1){
      this.currentZoom--;
      this.zoom.scaleTo(this.svg.transition().duration(400), this.currentZoom);   
    }
  }

  triggerLaso(){
    console.log('active lasso');
  }

  handleRootEvents (){
    //on refresh
    this.root.$on('refreshMap', (event, data) => {
      if(data.mapType.toLowerCase() == this.type) {
        this.refreshMap();
      }
    });

    //on toggle lock
    this.root.$on('toggleLock', (event, data) => {
      if(data.mapType.toLowerCase() == this.type) {
        if(data.toLock){
          this.element.addClass('locked-area');
        } else {
          this.element.removeClass('locked-area');
        }
      }
    });

    this.root.$on('zoom', (event, data) => {
      if (data.watching == this.type){
        if (data.direction == 'in') {
          this.zoomIn();
        } else {
          this.zoomOut();
        }        
      }
    });

    this.root.$on('lasso', (event, data) => {
      if (data.watching == this.type){
        this.triggerLaso();      
      }
    });

    this.root.$on('refreshDBData', (event) => {
        this.loadData(this.type).then(()=>{
          this.refreshMap();
        });
    });
  }

  getCountryFromCode(code){
    let c = null;

    angular.forEach(this.countries, function(country){
      if(country.code == code){
        c = country;
      }
    });

    return c;
  }

  getCountryFromIso(iso){
    let c = null;

    angular.forEach(this.countries, function(country){
      if(country.iso == iso){
        c = country;
      }
    });

    return c;
  }
}

const name = 'mapComponent';

export default angular.module(name, [])
  .component(name, {
    controllerAs : name,
    controller : MapComponent,
    bindings : {
      type : '@'
    }
  });
