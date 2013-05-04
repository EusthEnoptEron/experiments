App.WindowView = Backbone.View.extend({
	el: $(window),
	events: {
		"resize" : "resize",
		"scroll" : "resize"
	},
	initialize: function() {
		this.listenTo(App.users, "add", this.addUser);
		// App.socket.on("user_notify", function(user, notification) {
		// 	console.log(user, notification);
		// });
		App.users.forEach(this.addUser, this);

		// Trigger initial resize
		this.resize();
	},
	addUser: function(user) {
		if(user.get("name") != App.user) {
			var view = new App.UserView({model: user});
			$("body").prepend(view.render().el);
		}
	},
	render: function() {
		return this;
	},
	resize: function() {
		App.socket.emit("notify", {viewport: this.getBounds()});
		// App.user.set("viewport", this.getBounds());
	},
	getBounds: function() {
		return [
			this.$el.scrollLeft(),
			this.$el.scrollTop(),
			this.el.innerWidth,
			this.el.innerHeight
		];
	}
});