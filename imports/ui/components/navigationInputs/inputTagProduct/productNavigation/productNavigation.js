import angular from 'angular';
import angularMeteor from 'angular-meteor';
import matchMedia from 'angular-media-queries';

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import template from './productNavigation.html';


class ProductNavigation {
	constructor ($scope, $reactive, $rootScope, screenSize, $state, $timeout) {
		'ngInject';

		$reactive(this).attach($scope);

		this.root = $rootScope;
		this.state = $state;
		this.timeout = $timeout;
		this.lazyLoad = true; //animar correctamente cuando se cargan tarde
		this.menuState = false;
		this.levelChildrens = 0;
		this.parentSelected = {};

		
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
			color : ''
		};

		$scope.$watch(
			() => {this.parents.length},
			() => {this.lazyLoad = (this.parents.length > 0 ) ? false : true;}
		);
	}

	toggleMenu (data = {menu : this.menu}){
		this.menuState = true;
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

	closeMenu (e = null) {
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
		if(e) e.stopPropagation();

		this.menuState = false;
	}

	logout (){
		Accounts.logout(() => {
			this.state.go('auth');
		});
	}

	preSelectParent (parent, event){
		this.stop(event);
		const parentElement = $('[parent="'+parent.codeParent+'"]');
		const optionsMobileElement = $('[options-mobile]');

		if(this.isMobile){
			if(parentElement.hasClass('selected')){
				this.parentSelected = {};
				parentElement.removeClass('selected');
				optionsMobileElement.removeClass('active');
			} else {
				this.parentSelected = parent;
				$('[parent]').removeClass('selected');
				parentElement.addClass('selected');
				optionsMobileElement.addClass('active');
			}
		} else {
			this.selectParent(parent);
		}
	}

	selectParent (parent = this.parentSelected) {
		if(parent.codeParent){
			this.getChildren({
				parent : parent
			});	
			this.levelChildrens = 2;
			this.animateTransitionBetweenLevelProduct(0, 2);
		} else {
			//isChildren
			this.levelChildrens = (this.levelChildrens < 6) ? this.levelChildrens + 2 : 6;
			//getChildren

		}
	}

	submit(event, parent = this.parentSelected){
		if(parent)
			this.closeMenu(event);

	}

	goBack(event){
		this.stop(event);
		if(this.levelChildrens > 0){
			this.animateTransitionBetweenLevelProduct(this.levelChildrens, this.levelChildrens -2);
			this.levelChildrens -= 2;
		} else {
			//error handler
		}
	}

	//Animation methods
	animateTransitionBetweenLevelProduct(fromLevel = this.levelChildrens-2, toLevel = this.levelChildrens){
		//from parent to firs children
		const parentElement = $('[parent]');
		var childrenElement = $('[children-level="'+this.levelChildrens+'"]');

		if (fromLevel == 0 && toLevel == 2){
			// Hide Parent
			parentElement.addClass('product-transition to-hide');

			this.timeout(() => { 
				parentElement.css({'display' : 'none'}); 

				// Show Children
				this.animateChildrenOnDBReturn($('[children-level="'+this.levelChildrens+'"]'));
			},400);
		}

//REVERSEEEE
		//from first children to parent
		if (fromLevel == 2 && toLevel == 0){
			this.animateChildrenOnDBReturn(childrenElement, true);

			this.timeout(() => { 
				parentElement.css({'display' : 'block'});
				parentElement.removeClass('to-hide');
			},400);

		}
	}

	animateChildrenOnDBReturn (childrenElement, reverse = false){
		// Si los Children llegan tarde no hay elementos a animar
		// Y va checkeando los elementos li para iniciar la animación cuando lleguen
		if(childrenElement && childrenElement.length > 0){
			if(reverse){ //going back
				childrenElement.removeClass('lazy-load');
				this.timeout(() => { 
					childrenElement.css({'display' : 'none'});
				},400);
			} else { //moving forward
				childrenElement.css({'display' : 'block'});
				childrenElement.addClass('product-transition lazy-load');
			}
		} else { //recursive 
			childrenElement = $('[children-level="'+this.levelChildrens+'"]');
			this.animateChildrenOnDBReturn(childrenElement, reverse);
		}
	}
};

const name = 'productNavigation';

export default angular.module(name, [
	angularMeteor,
	'matchMedia'
]).component(name, {
	template,
	bindings : {
		menu : '@',
		parents : '<',
		childrens : '<',
		getChildren : '&'
	},
	controllerAs : name,
	controller : ProductNavigation
});
