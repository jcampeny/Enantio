import angular from 'angular';
import angularMeteor from 'angular-meteor';
import ngMaterial from 'angular-material';
import matchMedia from 'angular-media-queries';

import { Meteor } from 'meteor/meteor';

import { Favorites } from '../../../api/favorites/index'
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

		this.subscribe('favorites');

		this.helpers({
			favorites(){
				return Favorites.find({}); 
			}
		});

		this.order = 'name';
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
		Meteor.call('removeFavorite', favorito._id, 
			(err, res)=>{
				console.log(err);
			}
		);
	}

	openPopUp (favorito){
		this.root.$broadcast('openPopUp', {
		    reason : 'deleteFavorite',
		    text : 'Seguro que quiere borrar este Favorito?',
		    item : favorito
		});
	}

	useFavorite (favorito){
		this.root.$broadcast('favoriteFilterSelected', {
			filter : favorito.filter
		});
	}

};

function getMonth(){
	return function(date){
		const parseDate = new Date(date);
		const monthString = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEPT', 'OCT', 'NOV', 'DIC'];
		return monthString[parseDate.getMonth()];
	}
}
function getDay(){
	return function(date){
		const parseDate = new Date(date);
		return parseDate.getDate();
	}
}
const name = 'favoritos';

export default angular.module(name, [
	angularMeteor,
	ngMaterial,
	'matchMedia'
]).component(name, {
	template,
	controllerAs : name,
	controller : Favoritos
})
.filter('getMonth', getMonth)
.filter('getDay', getDay);
