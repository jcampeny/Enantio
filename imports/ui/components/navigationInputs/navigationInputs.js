import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngAria from 'angular-aria';
import matchMedia from 'angular-media-queries';

import { name as InputTag } from './inputTag/inputTag';

import template from './navigationInputs.html';

class NavigationInputs {
	constructor ($scope, $reactive, $rootScope, screenSize, $timeout) {
		'ngInject';

		$reactive(this).attach($scope);

		this.timeout = $timeout;

		this.sectionSelected = '';
		this.root = $rootScope;

		this.isMobile = screenSize.is('xs, sm');
		this.isDesktop = !screenSize.is('xs, sm');

		screenSize.on('xs, sm',(match) =>{
		    this.isDesktop = !match;
		    this.isMobile = match;
		    this.resizeInputs();
		});	

		$('html').click((event) =>{
			this.onSectionSelected('', event);
			$scope.$apply();
		});

		$(document).ready(() => { this.resizeInputs();});

		this.producto   = [];
		this.importador = [];
		this.exportador = [];

		this.catchRootEvents();	
	}

	onSectionSelected (section = '', event) {
		if(event)
			event.stopPropagation();

		if(section != this.sectionSelected && section != '')
			this.contractHeader(this.sectionSelected, event);

		this.sectionSelected = section;

		$('#input-' + section).focus();

		if(this.isMobile)
			this.timeout(() => {this.resizeInputs();}, 400);
	}

	expandHeader (name, event) {
		const height = 80 + (this[name].length * 30) + 10;

		$('header').css({
			'height' : height + 'px'
		});

		this.onSectionSelected('', event);

		this.sectionSelected = name;

		this.timeout(() => {this.resizeInputs();}, 400);

		this.root.$broadcast('expandedHeader', { name : name });
	}

	contractHeader (name, event) {
		const height = (this.isMobile) ? 120 : 80;

		$('header').css({
			'height' : height + 'px'
		});


		this.onSectionSelected('', event);
		this.timeout(() => {this.resizeInputs();}, 400);

		this.root.$broadcast('contractedHeader', { name : name });
	}

	resizeInputs () {
		const marginLeft = 20;
		const marginTop = (this.isMobile) ? 10 : 15;

		const widthProducto   = $('[nav-option="'+'producto'+'"]').width() + marginLeft;
		const widthImportador = $('[nav-option="'+'importador'+'"]').width() + marginLeft;
		const widthExportador = $('[nav-option="'+'exportador'+'"]').width() + marginLeft;

		const heightProducto   = $('[nav-option="'+'producto'+'"]').height() + marginTop;
		const heightImportador = $('[nav-option="'+'importador'+'"]').height() + marginTop;
		const heightExportador = $('[nav-option="'+'exportador'+'"]').height() + marginTop;

		const offsetProducto = $('[nav-option="'+'producto'+'"]').offset();
		const offsetImportador = $('[nav-option="'+'importador'+'"]').offset();
		const offsetExportador = $('[nav-option="'+'exportador'+'"]').offset();

		$('[input-select-options="'+'producto'+'"]').css({
			'width': widthProducto, 
			'left' : offsetProducto.left,
			'top' : offsetProducto.top + heightProducto
		});

		$('[input-select-options="'+'importador'+'"]').css({
			'width': widthImportador, 
			'left' : offsetImportador.left,
			'top' : offsetImportador.top + heightImportador
		});

		$('[input-select-options="'+'exportador'+'"]').css({
			'width': widthExportador, 
			'left' : offsetExportador.left,
			'top' : offsetExportador.top + heightExportador
		});
	}

	catchRootEvents () {
		this.root.$on('expandHeader', (event, data) => {
			this.expandHeader(data.name, data.event);
		});

		this.root.$on('contractHeader', (event, data) => {
			this.contractHeader(data.name, data.event);
		});

		this.root.$on('closeCountries', (event, data) => {
			this.onSectionSelected('', data.event);
		});
	}
};

const name = 'navigationInputs';

export default angular.module(name, [
	angularMeteor,
	ngAria,
	InputTag,
	'matchMedia'
]).component(name, {
	template,
	controllerAs : name,
	controller : NavigationInputs
}).filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
}).config(config);

function config ($ariaProvider) {
	'ngInject';

	$ariaProvider.config({

		tabindex : false,

		bindRoleForClick : false
	});
}

