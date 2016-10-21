import * as d3geo from "d3-geo";
import * as d3 from "d3";
import * as topojson from "topojson";
import countriesMap from './countries_110.json';

class MapComponent
{
	constructor($reactive, $scope, $q, $timeout, $rootScope){
		'ngInject';

    $reactive(this).attach($scope);
    
    this.root = $rootScope;
    this.q = $q;

    this.projection = null;
    this.path       = null;
    this.svg        = null;
    this.data       = [];
    this.dataNest   = {};
    this.valueScale = null;
    this.width      = $(this.type).width();
    this.height     = $(this.type).height();
    this.totalValue = 0;

    this.setupMap(this.width, this.width*0.6);

    this.loadData(this.type).then(()=>{
    this.renderMap(this.type, this.width); 

    this.renderTimeout;

    $scope.$watch(
      ()=>$(this.type).width() + $(this.type).height(), 
      ()=>{
        $timeout.cancel(this.renderTimeout);
        this.renderTimeout = $timeout(() => { this.refreshMap(); },400);
      });     
    });

    this.root.$on('refreshMap', (event, data) => {
      if(data.mapType.toLowerCase() == this.type) {
        this.refreshMap();
      }
    });
	}

  refreshMap(){
    this.width      = $(this.type).width();
    this.height     = $(this.type).height();
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
  }

  loadData(type){
    let deferred = this.q.defer();
    let self = this;
    // let parser = d3.dsvFormat(";");
    var min = Infinity;
    var max = -Infinity;

    // d3.request("data/annual_comtrade_2008_spain.csv")
    //   .mimeType("text/plain")
    //   .response(function(xhr) { return parser.parse(xhr.responseText); })
    d3.request("data/dataset.json")
      .mimeType("application/json")
      .response(function(xhr) { return JSON.parse(xhr.responseText); })
      .get((data) => {
        let tradeFlow = "-1";
        if(type === "importadores"){
          tradeFlow = "1";
        }else if(type === "exportadores"){
          tradeFlow = "2";
        }

        angular.forEach(data.dataset, (d) => {
          if(d.rgCode == tradeFlow && d.pt3ISO === "WLD"){
            if(!self.dataNest[d.rt3ISO]){
              self.dataNest[d.rt3ISO] = { countryName : d.rtTitle };
            }
            if(!self.dataNest[d.rt3ISO]['agg_'+d.aggrLevel]){
              self.dataNest[d.rt3ISO]['agg_'+d.aggrLevel] = parseFloat(d.TradeValue);
            }else{
              self.dataNest[d.rt3ISO]['agg_'+d.aggrLevel] += parseFloat(d.TradeValue);
            }
            min = Math.min(min, parseFloat(d.TradeValue));
            max = Math.max(max, parseFloat(d.TradeValue));
            self.totalValue += parseFloat(d.TradeValue);
          }
        });

        self.valueScale = d3.scaleLinear()
          .domain([min, max])
          .range([1, 15]);
        deferred.resolve();
      });
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

    let tooltip = d3.select(this.type).append('div').attr("id", "mapTooltip");

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
          return "translate(" + this.path.centroid(d) + ")";   
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

            var tooltipPercent = Math.round(parseFloat(self.dataNest[d.properties.iso_a3].agg_0 / self.totalValue) * 10000) / 100;

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
        .transition()
        .duration(1000)
        .attr("r",(d) => {
          if(self.dataNest[d.properties.iso_a3]){
            return this.valueScale(self.dataNest[d.properties.iso_a3].agg_0);  
          }else{
            return 0;
          }
        });

    var zoom = d3.zoom()
        .scaleExtent([1, 8])
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
      });

    //set handle function to this.svg element
    this.svg.call(zoom);
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
