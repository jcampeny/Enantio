import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './datePicker.html';

class DatePicker {
	constructor ($scope, $reactive) {
		'ngInject';

		$reactive(this).attach($scope);

		this.isDatePickerOpen = false;
		this.temporalDate = angular.copy(this.selectedDate);

		//get actual date
		const currentDate = new Date();
		this.currentYear = currentDate.getFullYear();

		this.datePanel = this.datePanelConstructor();

		$('html').click((event) =>{
			if(this.isDatePickerOpen){
				this.closeDatePicker(event);
				$scope.$apply();				
			}
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
		}
	}

	closeDatePicker(event){
		this.isDatePickerOpen = false;
		$('body').removeClass('date-picker-open');	
	}

	submitNewDates(event){
		if(this.temporalDate.start > this.temporalDate.end)
			this.temporalDate.start = this.temporalDate.end;

		this.selectedDate = angular.copy(this.temporalDate);
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

