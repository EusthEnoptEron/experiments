(function() {
	var colors = ["Red",
			"Maroon",
			"Yellow",
			"Olive",
			"Lime",
			"Green",
			"Aqua",
			"Teal",
			"Blue",
			"Navy",
			"Fuchsia",
			"Purple"];

App.User = Backbone.Model.extend({
	defaults: {
		color: null,
		viewport: [0,0,0,0]
	},
	idAttribute: "name",
	initialize: function() {
		if(!this.has("color"))
			this.set("color", colors.shift() || "red");
	}
});

})();