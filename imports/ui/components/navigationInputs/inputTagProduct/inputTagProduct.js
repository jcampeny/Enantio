import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Products } from '../../../../api/products/index';
import template from './inputTagProduct.html';


class InputTagProduct {
	constructor ($scope, $reactive, $rootScope) {
		'ngInject';

		$reactive(this).attach($scope);

		this.searchText = '';

		this.subscribe('products');

		this.limit = 5;
		this.expanded = false;

		this.root = $rootScope;

		this.helpers({
			products(){
				return Products.find({
					"name_es" : {
				    	$regex: new RegExp('^' + this.getReactively('searchText')),
				    	$options : 'i'
				  	}
				}, {limit : this.limit});
			}
		});

		$('html').click((event) =>{
			this.searchText = '';
			this.contractHeader(event);
			$scope.$apply();
		});

		this.catchRootEvents();
	}

	selectProduct (product, event) {console.log(product);
		if(!this.productAreSelected(product).found){
			this.selected.push(product);
			this.searchText = '';
			this.contractHeader(event);
			this.root.$broadcast('closeProducts', {
				event : event
			});
		}
	}

	removeProduct (product) {
		var index = this.productAreSelected(product).item;

		this.selected.splice(index,1);
	}

	productAreSelected (product) {
		var found = false;
		var index = null;

		angular.forEach(this.selected, (productItem, i) => {
			if (product.code == productItem.code){
				found = true;
				index = i;
			}
		});

		return {
			found : found,
			index : index
		};
	}

	expandHeader (event) {
		this.root.$broadcast('expandHeader', {
			name : this.name,
			event : event
		});
	}

	contractHeader (event) {
		this.root.$broadcast('contractHeader', {
			name : this.name,
			event : event
		});
	}

	catchRootEvents () {
		this.root.$on('expandedHeader', (event, data) => {
			if(data.name == this.name)
				this.expanded = true;
		});

		this.root.$on('contractedHeader', (event, data) => {
			this.expanded = false;
		});
	}

};

const name = 'inputTagProduct';

export default angular.module(name, [
	angularMeteor
]).component(name, {
	template,
	bindings : {
		name : '@',
		selected : '='
	},
	controllerAs : name,
	controller : InputTagProduct
});
