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
		this.childrenSelected = {};
		this.childrensTemporal = [];

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

	closeAndBack(event = null){
		this.closeMenu(event);
		this.root.$broadcast('openProducts', {event});
	}

	useProduct (product){
		this.closeMenu();
		this.result = product;
	}

	preSelectParent (parent, event, type = 'parent'){
		this.stop(event);

		const code = (parent.isParent) ? parent.codeParent : parent.code;
		const parentElement = $('['+type+'="'+code+'"]');
		const optionsMobileElement = $('[options-mobile]');

		if(this.isMobile){
			if(parentElement.hasClass('selected')){
				this[type + "Selected"] = {};
				parentElement.removeClass('selected');
				optionsMobileElement.removeClass('active');
			} else {
				this[type + "Selected"] = parent;
				$('['+type+']').removeClass('selected');
				parentElement.addClass('selected');
				optionsMobileElement.addClass('active');
			}
		} else {
			if(this.childSelected > 0)
				this.selectParent(parent);
		}
	}

	selectParent (parent = this.parentSelected) {
		if(this.levelChildrens < 2){
			this.getChildren({
				parent : parent
			});	
			this.levelChildrens = 2;
			this.animateTransitionBetweenLevelProduct(0, 2);
		} else {
			if(this.isMobile) 
				parent = this.childrenSelected;

			this.levelChildrens = (this.levelChildrens < 6) ? this.levelChildrens + 2 : 6;
			this.childrenSelected = parent;
			this.animateTransitionBetweenLevelProduct(2, 4);
		}
	}

	submit(event, parent = this.parentSelected){
		if(parent){
			if(this.levelChildrens > 0){
				parent = this.childrenSelected;
			}
			this.result = parent;
			this.closeMenu(event);
		}

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

	showSelectLevelChange(){

		return (!angular.equals(this.parentSelected, {}) && this.levelChildrens < 1) ||
               (!angular.equals(this.childrenSelected, {}) && this.levelChildrens > 1)
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

		if (fromLevel == 2 && toLevel == 4) {
			//MAS ALLA ENTRE CHILDRENS
			childrenElement = $('[children-level="'+fromLevel+'"]');
			this.animateChildrenOnDBReturn(childrenElement, false, true);
		}

//REVERSEEEE
		//from first children to parent
		if (fromLevel == 2 && toLevel == 0){
			this.animateChildrenOnDBReturn(childrenElement, true);

			this.timeout(() => { 
				parentElement.css({'display' : 'block'});
				this.timeout(() => { 
					parentElement.removeClass('to-hide');
				},50);
			},400);
		}

		if ((fromLevel == 4 && toLevel == 2) || (fromLevel == 6 && toLevel == 4) ){
			//MAS ALLA ENTRE CHILDRENS
			childrenElement = $('[children-level="'+fromLevel+'"]');
			this.animateChildrenOnDBReturn(childrenElement, true, true);
		}
	}

	animateChildrenOnDBReturn (childrenElement = null, reverse = false, isChildren = false){
		// Si los Children llegan tarde no hay elementos a animar
		// Y va checkeando los elementos li para iniciar la animación cuando lleguen

		if(childrenElement && childrenElement.length > 0){
			if(reverse){ //going back
				childrenElement.removeClass('lazy-load');

				if(isChildren){
					childrenElement
						.removeClass('lazy-load')
						.addClass('to-hide-reverse');

					this.childrenSelected = {};
					this.childrens = angular.copy(this.childrensTemporal[this.levelChildrens]);

					this.timeout(()=>{
						$('[children]').css({'display': 'none'});
						$('[children-level="'+this.levelChildrens+'"]').css({"display":"block"});
						$('[children-level="'+this.levelChildrens+'"]')
							.removeClass('to-hide-reverse')
							.addClass('lazy-load');
					}, 800);
				} else {
					this.timeout(() => { 
						childrenElement.css({'display' : 'none'});
					},400);
				}

			} else { //moving forward
				childrenElement.css({'display' : 'block'});
				childrenElement.addClass('product-transition lazy-load');

				if(isChildren){
					childrenElement
						.removeClass('lazy-load')
						.addClass('to-hide');
					//get New Childrens
					this.getChildren({
						parent : this.childrenSelected
					});

					this.childrensTemporal[this.levelChildrens] = angular.copy(this.childrens);
					this.childrenSelected = {};

					this.timeout(()=>{
						childrenElement.css({'display': 'none'});
						if(this.levelChildrens == 4)
							$('[children-level="'+(this.levelChildrens + 2)+'"]').css({"display":"none"});
						this.animateChildrenOnDBReturn();
					}, 400);
					
				}
			}
		} else { //recursive 
			if(isChildren){
				childrenElement = $('[children-level="'+(this.levelChildrens - 2)+'"]');
			} else {
				childrenElement = $('[children-level="'+this.levelChildrens+'"]');
			}
			
			this.animateChildrenOnDBReturn(childrenElement, reverse, isChildren);
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
		getChildren : '&',
		result : '='
	},
	controllerAs : name,
	controller : ProductNavigation
});
