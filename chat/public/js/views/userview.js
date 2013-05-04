App.UserView = Backbone.View.extend({
	tagName: "div",
	className: "user_viewport",
	initialize: function() {
		this.listenTo(this.model, "change", this.render);

		this.listenTo(this.model, "remove", this.remove);
	},
	resize: function() {
		this.render();
	},
	remove: function() {
		this.$el.remove();
	},
	render: function() {
		var vp = this.model.get("viewport");
		
		this.$el.css({
			left: vp[0] + "px",
			top:  vp[1] + "px",
			width: vp[2] + "px",
			height: vp[3] + "px",
			borderColor: this.model.get("color")
		});

		return this;
	}

});