var Status = {
	Preparing: 0,
	Login: 1,
	Ready: 2
};
App.AppView = Backbone.View.extend({
	el: "#chat",
	events: {
		"submit form": "post",
		"submit #loginForm form": "login"
	},
	socket: io.connect(window.location),
	initialize: function(config) {
		this.list = this.$el.find("#chatroom");
		this.input = this.$el.find("input[name=body]");
		this.messages = [];


		App.collection = new App.MessageCollection();
		this.listenTo(App.collection, "add", this.addMessage);
		
		this.socket.on('post', this.onMessage);
		this.socket.on("login", this.handleLogin.bind(this));
		this.socket.on("handshake", this.handleHandshake.bind(this));

		this.setStatus(Status.Preparing);
	},
	addMessage: function(model) {
		var view = new App.MessageView({
			model: model
		});

		this.list.append(view.render().el);
	},
	onMessage: function(data) {
		var model = new App.Message(data);
		App.collection.add(model);
	},
	post: function(e) {
		// Check input
		if(this.input.val()) {
			var data = {
				name: this.name,
				body: this.input.val()
			};
			this.socket.emit("post", data);
			this.onMessage(data)

			this.input.val("");
		}
		return false;
	},
	login: function(e) {
		console.log("oh boy, here we go");
		this.socket.emit("login", 
			$("[name=username]").val());

		return false;
	},
	handleLogin: function(res) {
		if(res.success) {
			this.name = res.name;
			this.setStatus(Status.Ready);
		} else {
			alert("INVALID NICK!");
		}
	},
	handleHandshake: function(res) {
		if(res.newUser) {
			this.setStatus(Status.Login);
		}
	},
	setStatus: function(status) {
		if(status != this.status) {
			this.status = status;

			if(status == Status.Login) {
				$('#loginForm').modal("show");
				$("[name=username]").focus();

			} else if(status == Status.Ready) {
				$('#loginForm').modal("hide");
				this.input.focus();
			}
		}
	}
});