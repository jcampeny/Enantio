import angular from 'angular';
import angularMeteor from 'angular-meteor';
import matchMedia from 'angular-media-queries';

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import template from './navMenu.html';


class NavMenu {
	constructor ($scope, $reactive, $rootScope, screenSize, $state) {
		'ngInject';

		$reactive(this).attach($scope);

		this.helpers({
			currentUser(){
				return Meteor.user();
			}
		});

		this.root = $rootScope;
		this.state = $state;
		this.menuState = false;

		
		$('html').click((e) =>{
			this.menuState = false;
			this.onMenuCall(this.menuState);
		});
		

		this.root.$on('toggleMenu', (event, data) => {
			if(data.menu == this.menu) {
				this.menuState = !this.menuState;
			}else{
				this.menuState = false;
			}
			this.onMenuCall(this.menuState, data.menu);
		});

		this.isMobile = screenSize.is('xs, sm');
		this.isDesktop = !screenSize.is('xs, sm');

		screenSize.on('xs, sm',(match) =>{
		    this.onResize(match);
		});
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

		TweenMax.fromTo(
			identifier, 
			1, //duration
			{
				css : {'height' : 'calc(0% - 60px)', 'transform' : 'translateY(-100%)'}
			},
			{//to
				ease: Power3.easeOut, 
				css
			}
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
