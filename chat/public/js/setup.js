$(function() {
	App.users = new App.UserCollection();
	App.users.fetch();

	var appView = new App.AppView();
	// -> Observer
	// var bodyView = new App.WindowView();
	var app = new App.Router();

	Backbone.history.start({pushState: false});
});