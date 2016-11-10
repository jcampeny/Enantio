import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

class DataTableService
{
  	constructor(){
  		'ngInject';
  		// $reactive(this).attach($scope);

  		this.data = {
  			fecha: [],
  			importadores: [],
  			exportadores: [],
  			codigo: [],
  			precio: []
  		};

      this.columns = {
        fecha: [{label: "Año", column:"_id"}, {label:"% de diferencia", column:"_calcFecha"}, {label:"Valor total - €", column:"total"}],
        importadores: [{label: "País", column:"countryName"}, {label:"% del total", column:"_calc"}, {label:"Valor total - €", column:"total"}],
        exportadores: [{label: "País", column:"countryName"}, {label:"% del total", column:"_calc"}, {label:"Valor total - €", column:"total"}],
        codigo: [{label: "Código arancelario", column:"_id"}, {label: "Descripción completa", column:"desc"}, {label:"Cantidad total", column:"total_qty"}, {label:"Valor total - €", column:"total"}],
        precio: [{label: "Precio unitario", column:"_id"}, {label:"Cantidad", column:"qty"}, {label:"Valor total - €", column:"total"}]
      };
  	}

  	setData(type, data){
  		this.data[type] = data;
  	}

  	getData(type){
  		return this.data[type];
  	}

    getColumns(type){
      return this.columns[type];
    }
  	
}

const name = 'dataTableService';

export default angular.module(name, [angularMeteor])
	.service(name, DataTableService);
