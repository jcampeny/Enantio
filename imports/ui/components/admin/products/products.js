import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import { Products } from '../../../../api/products/index';

import template from './products.html';

class AdminProducts {
	constructor ($scope, $reactive, $rootScope) {
		'ngInject';

		$reactive(this).attach($scope);

		this.root = $rootScope;

		this.selectedProduct = null;
		
		this.perPageOptions = [5, 10, 15, 20, 25];
		this.perPage = 5;
		this.page = 1;
		this.sort = {
			"name.es" : 1
		};
		this.searchText = '';

		this.helpers({
			products(){
				return Products.find({
					$or: [{
						$where : (object)=>{
							var found = false;
							var text = this.getReactively('searchText');

							angular.forEach(object.name, (value, key) => {
								var regExp = new RegExp('^' + text);
								if(value.toLowerCase().match(regExp))
									found = true;
							});

							return found;
						}
					},{
						"name.es" : {
					    	$regex: new RegExp('^' + this.getReactively('searchText')),
					    	$options : 'i'
					  	}
					}]
				}, {
					limit : parseInt(this.getReactively('perPage')),
					skip : parseInt((this.getReactively('page') - 1) * this.perPage),
					sort : this.getReactively('sort', true)
				});
			},
			totalPages(){
				return Math.ceil(Products.find({
					$or: [{
						$where : (object)=>{
							var found = false;
							var text = this.getReactively('searchText');

							angular.forEach(object.name, (value, key) => {
								var regExp = new RegExp('^' + text);
								if(value.toLowerCase().match(regExp))
									found = true;
							});

							return found;
						}
					},{
						"name.es" : {
					    	$regex: new RegExp('^' + this.getReactively('searchText')),
					    	$options : 'i'
					  	}
					}]
				}).count() / this.getReactively('perPage'));
			}
		});

		//catchEvents
		this.root.$on('confirmUpdateProduct', (event, data) => {
			if(data.accepted)
				this.updateProduct(data.item);
		});

		this.root.$on('createTraductionProduct', (event, data) => {
			this.selectedProduct = data.item;
		});
	}

	removeTraduction(key){
		delete this.selectedProduct.name[key];
	}
	selectProductToEdit(item){
		this.selectedProduct = angular.copy(item);
	}
	onCreateTraductionProduct(){
		this.root.$broadcast('openPopUp', {
			reason : 'createTraductionProduct',
			text : 'Introduzca el nombre del Producto y la abreviatura del idioma.',
			item : this.selectedProduct,
			action : 'Crear'
		});
	}

	onUpdateProduct(){
		this.root.$broadcast('openPopUp', {
		    reason : 'confirmUpdateProduct',
		    text : 'Seguro que quiere editar '+this.selectedProduct.name.es+' ?',
		    item : this.selectedProduct,
		    action : 'Actualizar'
		});
	}
	updateProduct(product){
		Meteor.call('updateProduct', product._id, product,
			(error) => {
				console.log(error);
				if (error) {
					console.log('Oops, unable to update the product...');
				} else {
					console.log(product.name.es + ' updated!');
				}
			}
		);
	}
	changePage(direction){
		if(this.page+direction > 0 && this.page+direction <= this.totalPages)
			this.page += direction;
	}
	toggleSort(){
		this.sort["name.es"] *= -1;
	}
	getNumber(num) {
	    return new Array(num+1);   
	}
};

const name = 'adminProducts';

export default angular.module(name, [
	angularMeteor
]).component(name, {
	template,
	controllerAs : name,
	controller : AdminProducts
});


