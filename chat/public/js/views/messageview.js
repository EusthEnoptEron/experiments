App.MessageView = Backbone.View.extend({
	tagName: "li",
	template: null,
	initialize: function() {
		this.template = _.template( $('#template-message').html() );
		this.listenTo(this.model, "change", this.render);
	},
	render: function() {
		this.$el.attr("id", this.model.getId());
		
		this.$el.html(this.template(this.model.toJSON()));
		if(this.model.get("hasDockedPanel")) {
			this.$el.addClass("docked");
		} else {
			this.$el.removeClass("docked");
		}
		return this;
	}
});