(function() {
var Status = {
	Preparing: 0,
	Login: 1,
	Ready: 2
};
App.AppView = Backbone.View.extend({
	el: "#chat",
	events: {
		"submit #input": "post",
		"submit #loginForm form": "login"
	},
	socket: App.socket,
	initialize: function(config) {
		this.list = this.$el.find("#chatroom");
		this.input = this.$el.find("input[name=body]");
		// this.messages = [];
		this.canvas = {};


		App.collection = new App.MessageCollection();
		this.listenTo(App.collection, "add", this.addMessage);
		
		this.socket.on('post', this.onMessage);
		this.socket.on("login", this.handleLogin.bind(this));
		this.socket.on("handshake", this.handleHandshake.bind(this));
		this.socket.on("canvas_action", this.handleCanvasAction.bind(this));

		this.setStatus(Status.Preparing);

		this.render();
	},
	render: function() {
		this.userlist = new App.UserlistView().render();
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
			switch(this.input.val()) {
				case "CANVAS":
					this.socket.emit("request_canvas");
					break;
				default:
					var data = {
						name: this.name,
						body: this.input.val()
					};
					this.socket.emit("post", data);
					this.onMessage(data)
					break;
			}

			this.input.val("");
		}
		return false;
	},
	login: function(e) {
		this.socket.emit("login", 
			$("[name=username]").val());

		return false;
	},
	handleLogin: function(res) {
		if(res.success) {
			this.name = res.name;
			App.user = this.name;
			
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
	handleCanvasAction: function(args) {
		var id = args[id];
		if(args.action == "create") {
			// console.log("create");
			this.canvas[id] = new App.CanvasView({id: id}).render();
			// console.log(this.canvas[id]);
			this.list.append(this.canvas[id].el);
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

})();