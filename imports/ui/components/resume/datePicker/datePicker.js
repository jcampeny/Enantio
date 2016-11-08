import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './datePicker.html';

import {name as FiltersService} from '../../dataviz/filtersService';

class DatePicker {
	constructor ($scope, $rootScope, $reactive, filtersService) {
		'ngInject';

		$reactive(this).attach($scope);

		this.filtersService = filtersService;
		this.root = $rootScope;

		this.isDatePickerOpen = false;
		this.temporalDate = angular.copy(this.selectedDate);

		//get actual date
		const currentDate = new Date();
		this.currentYear = currentDate.getFullYear() - 1;

		this.datePanel = this.datePanelConstructor();

		$('html').click((event) =>{
			if(this.isDatePickerOpen){
				this.closeDatePicker(event);
				$scope.$apply();				
			}
		});

		this.root.$on('refreshDBData', (event) => {
		    this.temporalDate = this.filtersService.years;
		    this.selectedDate = this.filtersService.years;
		});

	}

	//El temporalDate deberá guardar la fecha parseada y la fecha normal, 
	//para poder hacer las comparaciones y mostrarlo en el header correctamente
	//todo: crear nuevos atributos al temporalDate y pasar a los siguiente métodos
	//el tipo de fecha que se pasa (día, mes, año)
	temporalSelect(startOrEnd, theDate){
		this.temporalDate[startOrEnd] = theDate;
	}
	isSelected(startOrEnd, theDate){
		return this.temporalDate[startOrEnd] == theDate;
	}
	isGeneralSelected(startOrEnd, theDate){
		return this.selectedDate[startOrEnd] == theDate;
	}

	stop(event){
		event.stopPropagation();
	}

	openDatePicker(event){
		if(!this.isDatePickerOpen){
			this.stop(event);
			this.isDatePickerOpen = true;
			$('body').addClass('date-picker-open');	
			if($(window).width() > 960)
				$('#home-view').addClass('menu-active');	
		}
	}

	closeDatePicker(event){
		this.isDatePickerOpen = false;
		$('body').removeClass('date-picker-open');
		if($(window).width() > 960)
			$('#home-view').removeClass('menu-active');	
	}

	submitNewDates(event){
		if(this.temporalDate.start > this.temporalDate.end)
			this.temporalDate.start = this.temporalDate.end;

		this.selectedDate = angular.copy(this.temporalDate);
		
		this.filtersService.years = this.selectedDate;
		this.root.$broadcast('refreshDBData');

		this.closeDatePicker(event);
	}
	createYearPanel(lastYear, reverse = false){
		var calculatedYear = lastYear;
		var newYears = [];
		const yearsToDisplay = 9;

		if(reverse){
			var firstYear = lastYear - yearsToDisplay;

			while(calculatedYear >= firstYear){
				newYears.push(firstYear);
				firstYear++;
			}
		} else {
			const firstYear = lastYear + yearsToDisplay;

			while(calculatedYear <= firstYear){
				newYears.push(calculatedYear);
				calculatedYear++;
			}
		}

		return newYears;
	}

	datePanelConstructor(){
		/*
			Cuando se tenga que calcular días o meses habrá que 
			reescribir los métodos changeFrom y changeTo, para 
			que retornen arrays de meses o días
		*/
		return {
			from : this.createYearPanel(this.currentYear, true),
			to   : this.createYearPanel(this.currentYear, true),
			changeFrom : (reverse)=>{
				const year = (reverse) ? this.datePanel.from[0] : this.datePanel.from[9];
				this.datePanel.from = this.createYearPanel(year, reverse);
			},
			changeTo : (reverse)=>{
				const year = (reverse) ? this.datePanel.to[0] : this.datePanel.to[9];
				this.datePanel.to = this.createYearPanel(year, reverse);
			}
		};
	}

};

const name = 'datePicker';

export default angular.module(name, [
	angularMeteor
]).component(name, {
	template,
	bindings : {
		selectedDate : '='
	},
	controllerAs : name,
	controller : DatePicker
});

