(function() {
	var Status = {
		Idle: 0,
		Drawing: 1
	};

App.CanvasView = App.PanelView.extend({
	template: "template-canvas",
	events: {
		"mousedown canvas" : "start",
		"mousemove canvas": "update",
		"mouseout canvas": "mouseOut",
		"resize": "resize",
		"change input": "changeProperties"
	},
	width: 300,
	height: 200,
	changeProperties: function(e, d) {
		this.pen.width = this.$(".pen_width").val();
		this.pen.color = this.$(".pen_color").val();
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
		this.header = "Canvas";
		this.prevPos = null;
		this.pos = null;

		this.template = _.template( $('#' + this.template).html() );


		this.listenTo(App.socket, "canvas_action." + this.id, this.handleAction.bind(this));
		this.listenTo(this, "draw", this.draw);
		this.listenTo(this, "startPath", this.startPath);
	},
	handleAction: function(args) {
		if(args.id == this.id) {
			this.trigger(args.action, args.params);
		}
	},
	renderBody: function() {
		if(!this.body) {
			this.body = el = $(this.template()).get(0);
			var $el = $(el);
			if($el.is("canvas")) this.canvas = el;
			else this.canvas = $el.find("canvas").get(0);

			this.canvas.width = this.width;
			this.canvas.height = this.height;
			this.ctx = this.canvas.getContext("2d");


			$el.find(".pen_color").spectrum({
			    color: this.pen.color,
			    className: "pen_color"
			});
		}
		return this.body;
	},
	getPosition: function(e) {
		var offset = $(this.canvas).offset();
		return [e.pageX - offset.left, 
				e.pageY - offset.top];
	},
	// Start path
	start: function(e) {
		this.status = Status.Drawing;
		$("body").addClass("drawing");

		var path = this.currentPath = {
			pen: _.clone(this.pen),
			id: App.user + (this.id_seed++),
			points: [this.getPosition(e)]
		};
		this.emitAction("startPath", path);
		
		$(document).one("mouseup.canvas", this.stop.bind(this));
	},
	startPath: function(path) {
		this.paths[path.id] = path;
	},
	stop: function(e, silent) {
		if(!silent)
			$("body").removeClass("drawing");
		
		this.status = Status.Idle;
	},
	mouseOut: function(e) {
		if(this.status == Status.Drawing) {
			// console.log("STOP")
			this.stop(e, true);
			var that = this;
			this.$el.one("mouseenter", function(e) {
				$(document).off("mouseup.canvas");
				that.start(e);
			});
		}
	},
	update: function(e) {
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
	},
	resize: function() {
		this.canvas.height = this.$(".modal-body").height() - this.$(".controls").height();
		this.redraw();
		// this.canvas.w = this.$("modal-body").w();
	}
});

})();