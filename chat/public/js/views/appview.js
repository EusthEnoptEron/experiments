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
		this.list = this.$el.find("#chatroom")
					.on("scroll", this.scroll.bind(this));

		this.freeScroll = false;

		this.input = this.$el.find("input[name=body]");
		// this.messages = [];


		App.collection = new App.MessageCollection();
		this.listenTo(App.collection, "add", this.addMessage);
		
		this.socket.on('post', this.onMessage);
		this.socket.on("login", this.handleLogin.bind(this));
		this.socket.on("handshake", this.handleHandshake.bind(this));
		this.socket.on("canvas_action", this.handleCanvasAction.bind(this));
		this.socket.on("request_code", this.requestCode.bind(this));
		this.socket.on("pastebin:create", this.createPastebin.bind(this));

		this.setStatus(Status.Preparing);

		this.render();
	},
	render: function() {
		this.userlist = new App.UserlistView().render();
	},
	requestCode: function(token) {
		$('#pastebinForm')
			.modal("show")
			.on("submit", "form", function() {
				var values = $(this).serializeObject();
				App.socket.emit("post_code", token, values);
				$('#pastebinForm').modal("hide");
				return false;
			})
			.on("hidden", function() {
				$(this).off("submit","form");
			});
	},
	addMessage: function(model) {
		var view = new App.MessageView({
			model: model
		});

		this.list.append(view.render().el);
		this.scrollDown();
	},
	onMessage: function(data) {
		var model = new App.Message(data);
		App.collection.add(model)
		return model;
	},
	post: function(e) {
		// Check input
		if(this.input.val()) {
			var data = {
				name: this.name,
				body: this.input.val()
			};
			var msg = this.onMessage(data);
			data.p_id = msg.id;
			this.socket.emit("post", data);
			
			this.input.val("");
		}
		return false;
	},
	scroll: function(e) {
		var scrollableHeight = this.list.prop("scrollHeight")
							  -this.list.innerHeight();

		if(this.list.scrollTop() < scrollableHeight) {
			this.freeScroll = true;
		} else {
			this.freeScroll = false;
		}
		_.forEach(App.panels, function(panel) {
			panel.updatePosition();
		});
	},
	scrollDown: function() {
		if(!this.freeScroll) {
			var scrollableHeight = this.list.prop("scrollHeight")
							  -this.list.innerHeight();
			this.list.scrollTop(scrollableHeight);
		}
		_.forEach(App.panels, function(panel) {
			panel.updatePosition();
		});
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

			this.windowObserver = new App.WindowView();

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
			var view = new App.CanvasView({
				id: id, 
				message: App.collection.get(args.message)
			});
			App.panels.push(view);
			this.$el.append(view.render().el);

			this.scrollDown();
		}
	},
	createPastebin: function(values) {
		var model = new App.Pastebin(values);
		var view = new App.PastebinView({
			model: model,
			message: App.collection.get(values.message)
		});
		App.panels.push(view);
		this.$el.append(view.render().el);

		this.scrollDown();
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