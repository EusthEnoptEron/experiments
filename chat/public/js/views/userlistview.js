App.UserlistView = Backbone.View.extend({
	el: "#userlist",
	template: null,
	initialize: function(config) {
		this.template = _.template( $('#template-user-in-list').html() );
		this.users = new App.UserCollection();
		this.users.fetch();

		this.listenTo(this.users, "add", this.render);
		this.listenTo(this.users, "remove", this.render);

		this.listenTo(App.socket, "user_joins", this.onJoin.bind(this));
		this.listenTo(App.socket, "user_leaves", this.onLeave.bind(this));
		// this.listenTo(App.socket, "user_list", this.onList.bind(this));
		// App.socket.on("user_list", this.onList.bind(this));
		// App.socket.on("user_joins", this.onJoin.bind(this));
		// App.socket.on("user_leaves", this.onLeave.bind(this));
		// App.socket.on("user_joins", this.addUser.bind(this));

	},
	render: function() {
		// console.log(this);
		this.$el.empty();
		this.users.each(function(user) {
			this.$el.append(this.template(user.toJSON()));
		}, this);

		return this;
	},
	onJoin: function(username) {
		this.users.add(new App.User({name: username}));
	},
	onLeave: function(username) {
		this.users.remove(
			this.users.get(username)
		);
	}
});