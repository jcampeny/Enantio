import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngMaterial from 'angular-material';
import matchMedia from 'angular-media-queries';

import { Meteor } from 'meteor/meteor';

import template from './favoritos.html';


class Favoritos {
	constructor ($scope, $reactive, $rootScope, screenSize) {
		'ngInject';

		$reactive(this).attach($scope);

		this.root = $rootScope;

		this.isMobile = screenSize.is('xs, sm');
		this.isDesktop = !screenSize.is('xs, sm');

		screenSize.on('xs, sm',(match) =>{
		    this.isDesktop = !match;
		    this.isMobile = match;
		});

		this.root.$on('deleteFavorite', (event, data) => {
			if(data.accepted)
				this.deleteFavorite(data.item);
		});

		this.favorites = [
			{
				id : 'IURBGIJERBGER',
				day : {text : 'LU', number : '14'},
				name : 'Favorito A',
				color : 'yellow'
			},
			{
				id : 'GE9O57W48574B',
				day : {text : 'VI', number : '10'},
				name : 'Favorito B',
				color : 'magenta'
			},
			{
				id : '4B29NO7BVWB54',
				day : {text : 'MI', number : '08'},
				name : 'Favorito C',
				color : 'turquoise'
			},
			{
				id : 'RWTNREYNJTYJMTYM',
				day : {text : 'SA', number : '03'},
				name : 'Favorito D',
				color : 'blue'
			},
			{
				id : 'ASFHGTHRYJ',
				day : {text : 'VI', number : '10'},
				name : 'Favorito B',
				color : 'purple'
			},
			{
				id : 'YJ56356Y56J',
				day : {text : 'MI', number : '08'},
				name : 'Favorito C',
				color : 'turquoise'
			},
			{
				id : '4B6536BU45',
				day : {text : 'DO', number : '29'},
				name : 'Favorito R',
				color : 'blue'
			}
		];

	}

	onSwipeLeft (event) {
		if(this.isMobile) {
			$('[md-swipe-left]').removeClass('remove');
			$(event.currentTarget).addClass('remove');
		}
	}

	onSwipeRight (event) {
		if(this.isMobile)
			$(event.currentTarget).removeClass('remove');
	}

	onDeleteFavorite (favorito) {
		$('[md-swipe-left]').removeClass('remove');

		if(this.isDesktop) {
			this.openPopUp(favorito);
		}else{
			this.deleteFavorite(favorito);
		}
	}

	deleteFavorite (favorito) {
		$('#'+ favorito.id).addClass('removed');
		console.log('favorito deleteado: ' + favorito.id);
	}

	openPopUp (favorito){
		this.root.$broadcast('openPopUp', {
		    reason : 'deleteFavorite',
		    text : 'Seguro que quiere borrar este Favorito?',
		    item : favorito
		});
	}

};

const name = 'favoritos';

export default angular.module(name, [
	angularMeteor,
	ngMaterial,
	'matchMedia'
]).component(name, {
	template,
	controllerAs : name,
	controller : Favoritos
});
