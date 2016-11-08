import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';

import { Products } from '../../../../api/products/index';
import template from './inputTagProduct.html';
import { name as ProductNavigation} from './productNavigation/productNavigation';

import {name as FiltersService} from '../../dataviz/filtersService';

class InputTagProduct {
	constructor ($scope, $reactive, $rootScope, filtersService) {
		'ngInject';

		$reactive(this).attach($scope);

		this.searchText = '';
		this.codeBaseToFind = '0101';
		this.levelToFind = '4';
		this.parentSelected = {};
		this.subscribe('products');

		this.limit = 5;
		this.expanded = false;
		this.unSelected = true;
		
		this.root = $rootScope;
		this.filtersService = filtersService;

		this.helpers({
			products(){
				return Products.find({
					$or: [
						{
							$where : (object)=>{
								var found = false;
								var text = this.searchText;

								angular.forEach(object.name, (value, key) => {
									var regExp = new RegExp('^' + text);
									if(value.toLowerCase().match(regExp))
										found = true;
								});

								return found;
							}
						},{
						  	"code" : {
						      	$regex: new RegExp('^' + this.getReactively('searchText').split('.').join("")),
						      	$options : 'i'
						    },
						   	isParent: {
						   		$exists: false
						   	}
						}
					],

				}, {limit : this.limit});
			},
			productsParent (){
				return Products.find({
					isParent : true
				});
			},
			productsByParent (){
				if(this.getReactively('parentSelected.childrens', true)){
					return Products.find({
						code : {
							$in : this.getReactively('parentSelected.childrens', true)
						}
					});
				} else {
					return Products.find({
						"code" : {
						   	$regex: new RegExp('^' + this.getReactively('parentSelected.code')),
						   	$options : 'i'
						}
					}, {skip : 1});
				}

			}
		});

		$('html').click((event) =>{
			if(this.expanded){
				this.searchText = '';
				this.contractHeader(event);
				$scope.$apply();				
			}

		});

		//input bug (Mueve el input de la pantalla cuando se ahce focus, lo comentamos si tienes que tocarlo)
		$('[nav-option="producto"]').on('click', (event)=>{
			this.unSelected = false;
			$scope.$apply();
		});

		this.catchRootEvents();
	}

	selectProduct (product, event) {
		if(!this.productAreSelected(product).found){
			this.selected = product;
			this.root.product = product;
			this.searchText = '';
			this.contractHeader(event);
			this.root.$broadcast('closeProducts', {
				event : event
			});

			this.filtersService.product = product.code;
			this.filtersService.aggregateLevel = parseInt(product.level);
			this.root.$broadcast('refreshDBData');
		}
	}

	removeProduct (product) {
		var index = this.productAreSelected(product).item;

		this.selected.splice(index,1);

		this.filtersService.product = null;
		this.filtersService.aggregateLevel = 2;
		this.root.$broadcast('refreshDBData');
	}


	resetProduct (event){
		event.stopPropagation();
		this.selected = null;
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

	toggleMenu (event, menu = 'product-navigation') {
		this.contractHeader(event);
		this.root.$broadcast('toggleMenu', {
		    menu : 'product-navigation'
		});
	}

	getChildren (parent){
		this.parentSelected = parent;
	}

};

const name = 'inputTagProduct';

export default angular.module(name, [
	angularMeteor,
	ProductNavigation
]).component(name, {
	template,
	bindings : {
		name : '@',
		selected : '='
	},
	controllerAs : name,
	controller : InputTagProduct
});
