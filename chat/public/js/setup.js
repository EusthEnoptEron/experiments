$(function() {

	var appView = new App.AppView();
	var app = new App.Router();

	app.on("route:login", function() {
		// appView.login();
	});

	Backbone.history.start({pushState: false});
});