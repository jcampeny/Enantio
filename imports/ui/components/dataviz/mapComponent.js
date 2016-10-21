import * as d3geo from "d3-geo";
import * as d3 from "d3";
import * as topojson from "topojson";
import countriesMap from './countries_110.json';

class MapComponent
{
	constructor($reactive, $scope, $q, $timeout){
		'ngInject';
    $reactive(this).attach($scope);

console.log("DEBUG: "+$scope.type);
    this.q = $q;
    this.type = $scope.type;
    this.projection = null;
    this.path       = null;
    this.svg        = null;
    this.data       = [];
    this.dataNest   = {};
    this.valueScale = null;
    this.width      = $(this.type).width();
    this.height     = $(this.type).height();

    this.setupMap(this.width, this.width*0.6);

    this.loadData(this.type).then(()=>{
    this.renderMap(this.type, this.width); 

    $scope.$watch(
      ()=>this.width + this.height, 
      ()=>{
        $timeout(() => {
          this.setupMap(this.width, this.width * 0.6);
          this.removeMap();
          this.renderMap(this.type, this.width);               
        },0);
      });     
    });
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
    this.type = type;
    let deferred = this.q.defer();
    let self = this;
    let parser = d3.dsvFormat(";");
    var min = 0;
    var max = Infinity;

    d3.request("data/annual_comtrade_2008_spain.csv")
      .mimeType("text/plain")
      .response(function(xhr) { return parser.parse(xhr.responseText); })
      .get(function(data){
        let tradeFlow = "-1";
        if(type === "importadores"){
          tradeFlow = "1";
        }else if(type === "exportadores"){
          tradeFlow = "2";
        }

        angular.forEach(data, function(d){
          if(d['Trade Flow Code'] === tradeFlow && d['Partner ISO'] === "WLD"){
            if(!self.dataNest[d['Reporter ISO']]){
              self.dataNest[d['Reporter ISO']] = {};
            }
            if(!self.dataNest[d['Reporter ISO']]['agg_'+d['Aggregate Level']]){
              self.dataNest[d['Reporter ISO']]['agg_'+d['Aggregate Level']] = parseFloat(d['Trade Value (US$)']);
            }else{
              self.dataNest[d['Reporter ISO']]['agg_'+d['Aggregate Level']] += parseFloat(d['Trade Value (US$)']);
            }
            min = Math.min(min, parseFloat(d['Trade Value (US$)']));
            max = Math.max(max, parseFloat(d['Trade Value (US$)']));
          }
        });
        // self.dataNest = d3.nest()
        //   .key(function(d) { return d['Reporter ISO']; })
        //   .key(function(d) { return d['Aggregate Level']; })
        //   .rollup(function(leaves) { return  d3.sum(leaves, function(d) {return parseFloat(d['Trade Value (US$)']);}); })
        //   .entries(self.data);

        self.valueScale = d3.scaleLinear()
          .domain([min, max])
          .range([5, 30]);
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
        .attr("r",(d) => {
          if(self.dataNest[d.properties.iso_a3]){
            return this.valueScale(self.dataNest[d.properties.iso_a3].agg_2);  
          }else{
            return 0;
          }
        })
        .attr("fill",(d)=>{
          if(this.type === "importadores"){
            return "rgb(0,51,123)";
          }else if(this.type === "exportadores"){
            return "rgb(237,27,82)";
          }
        })
        .style("opacity","0.5");

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
          circles.attr("transform","translate("+ t[0] + ", " + t[1] + ")scale("+0.5 * s+")");            
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
