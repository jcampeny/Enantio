
export default function config($locationProvider, $urlRouterProvider, $stateProvider) {
	'ngInject';

	$stateProvider
		.state('parties', {url: '/parties', template: '<parties-list></parties-list>'})
		.state('partyDetails', {url: '/parties/:partyId', template: '<party-details></party-details>'});

	$locationProvider.html5Mode(true);

	$urlRouterProvider.otherwise('/parties');
}