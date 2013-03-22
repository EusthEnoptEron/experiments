App.Router = Backbone.Router.extend({
	routes: {
		"": "index",
		"login": "login"
	},
	index: function() {
		this.navigate("login", {trigger: true});
	}
});