angular.module('HueWeb').controller('SetupWizard', ['$scope', function(scope) {
	
	this.title = 'Philips Hue Web';
	
	this.step = 0;
	
	this.canNavigate = function() {
		return this.step < 5;
	};
	
	this.next = function() {
		this.step++;
	};
	
}]);