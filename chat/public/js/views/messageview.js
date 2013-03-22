App.MessageView = Backbone.View.extend({
	tagName: "li",
	template: null,
	initialize: function() {
		this.template = _.template( $('#template-message').html() );
	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});