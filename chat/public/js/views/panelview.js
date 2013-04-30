(function() {
	var template = null;


	var Mode = App.PanelMode = {
		Panel: 1,
		Embedded: 2,
		Docked: 3,
		Hidden: 4
	};

	var defaults = {
		header: "",
		body: "",
		message: null,
		mode: Mode.Hidden
	};

	var defaultMode = Mode.Docked;

	var events = {
		"click .buttons .btn-close" : function() {
			this.mode = Mode.Hidden;
			// this.render();
		},
		"click .buttons .btn-show" : function() {
			this.mode = this.getLastMode();
			// this.render();
		},
		"click .buttons .btn-dock" : function() {
			this.mode = Mode.Docked;
		},
		"click .buttons .btn-undock" : function() {
			this.mode = Mode.Panel;
		},
		"click .buttons .btn-lock" : function() {
			this.mode = this.mode == Mode.Embedded
				? this.getLastMode()
				: Mode.Embedded;
		},

	};

	App.PanelView = Backbone.View.extend({
		className: "panel",
		getLastMode: function() {
			return this._modeHistory.pop() || defaultMode;
		},
		updatePosition : function() {
			if( (this.mode == Mode.Docked || this.mode == Mode.Hidden)
				 && this.message) {
				var offset =$("#" + this.message.getId()).offset();
				var chatOffset = $("#chatroom").offset();
				var chatHeight = $("#chatroom").height();

				var pxOff = 0;
				var max = 100;
				if(offset.top < chatOffset.top) {
					pxOff = chatOffset.top - offset.top;
				} else if(offset.top > chatOffset.top + chatHeight ) {
					pxOff = offset.top - (chatOffset.top + chatHeight);
					max = 30;
				}
				pxOff = Math.min(max, pxOff);
				var opacity = 1 - pxOff / max;
				this.$el.css({
					"top": offset.top + "px",
					"left": (offset.left - this.$el.width()) + "px",
					"opacity": opacity
				});
			}
		},
		_configure: function(options) {
			this._modeHistory = [];

			Backbone.View.prototype._configure.apply(this, arguments);

			_.forEach(defaults, function(val, key) {
				//TODO: maybe use isLocalProperty?
				if(key in options) {
					val = options[key];
				}
				this[key] = val;
				
			}, this);

			if(this.message) {
				this.message.set("panel", this);
			}
		},
		delegateEvents: function() {
			this.events = _.defaults(this.events || {}, events);
			Backbone.View.prototype.delegateEvents.apply(this, arguments);
			this.$el.draggable({
				handle: ".handle",
				containment: "document"
			});
		},
		render: function() {
			template = template || _.template($("#template-panel").html());
			this.$el.empty().append(
				template({ 
					header: this.header || "",
					mode: this.mode
				}));
			
			var mode  = _.keys(Mode)[this.mode - 1].toLowerCase();
			this.$el.attr("class", this.$el.attr("class").replace(/\bmode-\w+\b/g, ""));
			this.$el.addClass("mode-" + mode);

			if(this.mode == Mode.Panel) {
				this.$el.draggable("enable");
			} else {
				this.$el.draggable("disable");
			}

			this.$el.find(".modal-body").append(this.renderBody());


			if(this.mode == Mode.Hidden) {
				this.$el.css("width", "auto")
						.css("height", "auto");
			} else {
				if(this.width) {
					this.$el.css("width", (this.width + 31) + "px");
				}
				if(this.height) {
					this.$el.css("height", (this.height + 31) + "px");
				}

			}

			this.updatePosition();

			return this;
		},
		renderBody: function() { return document.createElement("DIV"); }
	});


	App.PanelView.prototype.__defineGetter__("mode", function() {
		return this._mode === undefined
					? defaultMode
					: this._mode;
	});
		
	App.PanelView.prototype.__defineSetter__("mode", function(val) {
		if(val !== undefined) {
			this._modeHistory.push(this._mode);
			this._mode = val;

			if(this.message) {
				if(val == Mode.Docked || val == Mode.Hidden) {
					this.message.set("hasDockedPanel", true);
				} else {
					this.message.set("hasDockedPanel", false);
				}
			}
			
			if(this.$el)
				this.render();
		}
	});
	
})();