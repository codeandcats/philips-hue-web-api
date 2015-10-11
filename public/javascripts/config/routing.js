/*
angular.module('HueWeb').config(['$routeProvider', '$locationProvider',
	function($routeProvider, $locationProvider) {
		
		$routeProvider
			.when('/wizard/step-1', {
				templateUrl: '/wizard/step-1.jade',
				controller: 'BookCtrl',
				controllerAs: 'book'
			})
			.when('/Book/:bookId/ch/:chapterId', {
				templateUrl: 'chapter.html',
				controller: 'ChapterCtrl',
				controllerAs: 'chapter'
			});
			
		$locationProvider.html5Mode(true);
		
	}])
*/