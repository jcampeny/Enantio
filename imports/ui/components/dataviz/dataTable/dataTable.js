import angular from 'angular';
import angularMeteor from 'angular-meteor';

import {name as DataTableService} from '../dataTableService';

import template from './dataTable.html';

class DataTable {
	constructor($scope, $sce, $rootScope, $reactive, dataTableService){
		'ngInject';
		$reactive(this).attach($scope);

		this.root = $rootScope;
		this.sanitize = $sce;

		this.dataTableService = dataTableService;

		this.root.$on('showTable_'+this.type, (event) => {
			this.renderTable();
		  	self.showTable = true;
		});
		
	}

	trustHtml(text){
		if(typeof text === "string"){
			return this.sanitize.trustAsHtml(text);	
		}else if(typeof text === "number"){
			return text.toLocaleString();
		}else{
			return text;
		}
		
	}

	calc(total){
		return (Math.round(total/this.data.total *10000)/100) + '%';
	}

	calcFecha(index){
		if(index>0){
			let d = this.data.data[index];
			let prev = this.data.data[index-1];
			return (Math.round(((d.total-prev.total)/prev.total) * 10000)/100) + '%';
	
		}else{
			return "-";
		}
	}

	renderTable(){
		this.data = this.dataTableService.getData(this.type);
		this.columns = this.dataTableService.getColumns(this.type);
	}
}


const name = 'tableDataComponent';

export default angular.module(name, [
	angularMeteor,
	'ngSanitize',
]).component(name, {
	template,
	bindings : {
		type : '@'
	},
	controllerAs : name,
	controller : DataTable 
});