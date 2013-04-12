App.User = Backbone.Model.extend({
	defaults: {
		color: "red",
		viewport: [0,0,0,0]
	},
	idAttribute: "name"
});