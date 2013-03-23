(function() {
	var Status = {
		Idle: 0,
		Drawing: 1
	};

App.CanvasView = Backbone.View.extend({
	tagName: "li",
	template: "template-canvas",
	events: {
		"mousedown canvas" : "mouseDown",
		"mousemove canvas": "mouseMove",
	},
	initialize: function(conf) {
		this.id = conf.id;
		this.id_seed = 0;

		this.status = Status.Idle;
		this.pen = {
			color: "#000000",
			width: 2
		};
		this.paths = {};
		this.currentPath = {};

		this.prevPos = null;
		this.pos = null;

		this.template = _.template( $('#' + this.template).html() );


		this.listenTo(App.socket, "canvas_action", this.handleAction.bind(this));
		this.listenTo(this, "draw", this.draw);
		this.listenTo(this, "startPath", this.startPath);
	},
	handleAction: function(args) {
		if(args.id == this.id) {
			this.trigger(args.action, args.params);
		}
	},
	render: function() {
		this.$el.empty()
				.append(this.template());

		this.canvas = this.$el.find("canvas").get(0);
		this.ctx = this.canvas.getContext("2d");

		return this;
	},
	getPosition: function(e) {
		var offset = $(this.canvas).offset();
		return [e.pageX - offset.left, 
				e.pageY - offset.top];
	},
	// Start path
	mouseDown: function(e) {
		this.status = Status.Drawing;
		var path = this.currentPath = {
			pen: this.pen,
			id: App.user + (this.id_seed++),
			points: [this.getPosition(e)]
		};
		this.emitAction("startPath", path);
		
		$(document).one("mouseup", this.mouseUp.bind(this));
	},
	startPath: function(path) {
		this.paths[path.id] = path;
	},
	mouseUp: function(e) {
		this.status = Status.Idle;
	},
	mouseMove: function(e) {
		if(this.status == Status.Drawing) {
			var point = this.getPosition(e);
			var lastPoint = this.currentPath.points[
				this.currentPath.points.length - 1
			];
			if(Math.abs(point[0] - lastPoint[0]) +
				Math.abs(point[1] - lastPoint[1]) > 5) {
				this.emitAction("draw", {
					point: this.getPosition(e),
					pathId: this.currentPath.id
				});
			}
		}
	},
	emitAction: function(action, params) {
		App.socket.emit("canvas_action", {
			action: action,
			params: params,
			id: this.id
		});
		this.trigger(action, params);
	},
	draw: function(params) {
		console.log(params);
		if(params.pathId in this.paths) {
			this.paths[params.pathId].points.push(
				params.point
			);
		}
		this.redraw();
	},
	redraw: function() {
		var ctx = this.ctx;
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		_.forEach(this.paths, function(path) {
			ctx.beginPath();
			ctx.strokeStyle = path.pen.color;
			ctx.lineWidth = path.pen.width;

			ctx.moveTo(path.points[0][0], path.points[0][1]);
			for(var i = 1; i < path.points.length; i++) {
				ctx.lineTo(path.points[i][0], path.points[i][1]);
			}

			ctx.stroke();
		});
	}
});

})();