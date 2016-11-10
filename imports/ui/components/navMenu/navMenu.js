import angular from 'angular';
import angularMeteor from 'angular-meteor';
import matchMedia from 'angular-media-queries';

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import template from './navMenu.html';

import { Favorites } from '../../../api/favorites/index';

import {name as FiltersService} from '../dataviz/filtersService';

class NavMenu {
	constructor ($scope, $reactive, $rootScope, screenSize, $state, $timeout, filtersService, $location) {
		'ngInject';

		$reactive(this).attach($scope);

		this.subscribe('favorites');
		
		this.helpers({
			currentUser(){
				return Meteor.user();
			}, 
			favoritesCount(){
				return Favorites.find({}).count();
			}
		});

		this.filtersService = filtersService;
		this.root = $rootScope;
		this.state = $state;
		this.location = $location;
		this.timeout = $timeout;
		this.scope = $scope;
		this.menuState = false;
		this.expanded = '';
		
		$('html').click((e) =>{
			this.menuState = false;
			this.onMenuCall(this.menuState);
		});
		

		this.root.$on('toggleMenu', (event, data) => {
			this.toggleMenu (data)
		});

		this.isMobile = screenSize.is('xs, sm');
		this.isDesktop = !screenSize.is('xs, sm');

		screenSize.on('xs, sm',(match) =>{
		    this.onResize(match);
		});

		this.favoritos = {
			name : 'Favorito A',
			color : 'turquoise',
			error : '',
			loading : false
		};

		this.root.$on('vizSizeChange', (event, data)=>{
			this.expanded = data.id;
		});
	}

	expandViz(id, forced = false){
		if(this.expanded !== 'favoritos'){
			if(this.expanded != id || forced){
				if(this.expanded === '' || forced){
					this.expanded = id;
					this.root.$broadcast('expandViz', {
						id : this.expanded
					});
				} else {
					this.expanded = id;
					this.contractViz(true);
				}			
			}			
		} else {
			this.location.url('/');
			this.expanded = 'changing';
			this.expandViz(id);
		}

	}

	contractViz(forced = false){			
		if(this.expanded !== ''){
			this.root.$broadcast('contractViz', {
				id : this.expanded
			});
			if(forced){
				this.timeout(() => { 
					this.expandViz(this.expanded, forced); 
				},3000);
			} else {
				this.expanded = '';
			}
		}
	}

	toggleMenu (data = {menu : this.menu}){
		if(data.menu == this.menu) {
			this.menuState = !this.menuState;
		}else{
			this.menuState = false;
		}
		this.onMenuCall(this.menuState, data.menu);
	}

	stop(e){
		e.stopPropagation();
	}

	onResize (match){
		this.isDesktop = !match;
		this.isMobile = match;
	}

	onMenuCall (state, menu = '', actualMenu = this.menu) {
		if(state && menu == actualMenu){
			this.openMenu();
		} else { 
			this.closeMenu();
		}
	}

	openMenu () {
		let css = (this.isMobile) ? {'height' : 'calc(100% - 60px)'} : {'transform' : 'translateY(0%)'};
		let identifier = (this.menu == 'fav-menu') ? '['+this.menu+'] > ul' : '[nav-menu]['+this.menu+'] > ul';

		$('['+this.menu+']').removeClass('no-point');

		if(this.isDesktop)
			this.timeout(() => { $('#home-view').addClass('menu-active'); },100);

		TweenMax.fromTo(
			identifier, 
			1, //duration
			{
				css : {'height' : 'calc(0% - 60px)', 'transform' : 'translateY(-100%)'}
			},
			{//to
				ease: Power3.easeOut, 
				css,
				onComplete : () => {
					$('#home-view').addClass('menu-active');
				}
			},
		);

		TweenMax.staggerTo(
			identifier + " > li", 
			0.7, //duration each
			{ease: Power3.easeOut, opacity:1, x:0 }, 
			.1 //delay between each
		);
	}

	closeMenu () {
		let css = (this.isMobile) ? {'height' : 'calc(0% - 60px)'} : {'transform' : 'translateY(-100%)'};
		let identifier = (this.menu == 'fav-menu') ? '['+this.menu+'] > ul' : '[nav-menu]['+this.menu+'] > ul';

		$('['+this.menu+']').addClass('no-point');
		$('#home-view').removeClass('menu-active');

		TweenMax.to(
			identifier, 
			1, //duration
			{//to
				delay : 0.1,
				ease: Power3.easeInOut, 
				css
			}
		);
		TweenMax.staggerTo(
			identifier + " > li", 
			0.5, //duration each
			{ease: Power3.easeIn, opacity:0, x:20 }, 
			-.1, //delay between each
		);

	}

	logout (){
		Accounts.logout(() => {
			this.state.go('auth');
		});
	}

	saveFavorite(){
		this.favoritos.loading = true;

		const newFavorite = {
			owner : Meteor.userId(),
			date : new Date(),
			name : this.favoritos.name,
			color : this.favoritos.color,
			filter : this.filtersService.getFilters()
		};

		Meteor.call('insertFavorite', newFavorite, 
			(err, res) =>{
				if(err){
					this.favoritos.error = err.reason;
				} else {
					this.closeMenu();
					this.favoritos.error = '';
				}
				this.favoritos.loading = false;
				this.scope.$apply();
			}
		);
	}
};

const name = 'navMenu';

export default angular.module(name, [
	angularMeteor,
	'matchMedia'
]).component(name, {
	template,
	bindings : {
		menu : '@'
	},
	controllerAs : name,
	controller : NavMenu
});
