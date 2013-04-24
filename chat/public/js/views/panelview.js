(function() {
	var template = null;
	var defaults = {
		header: "",
		body: "",
		message: null
	};

	var Mode = App.PanelMode = {
		Panel: 0,
		Embedded: 1,
		Docked: 2
	};

	function onScroll() {
		if(this.getMode() == Mode.Docked) {
			var offset =$("#" + this.message.getId()).offset();

			this.$el.css({
				"top": offset.top + "px",
				"left": (offset.left - this.$el.width()) + "px"
			});
		}
	}

	App.PanelView = Backbone.View.extend({
		className: "panel",
		getMode: function() {
			return this._mode || Mode.Docked;
		},
		setMode: function(val, silent) {
			this._mode = val;
			this.render();
		},
		_configure: function(options) {
			Backbone.View.prototype._configure.apply(this, arguments);
			_.extend(this, _.pick(options, _.keys(defaults)));

			_.forEach(defaults, function(val, key) {
				//TODO: maybe use isLocalProperty?
				if(key in options) {
					this[key] = options[key];
				} else {
					this[key] = val;
				}
			});
			if(this.message) {

			}
		},
		delegateEvents: function() {
			Backbone.View.prototype.delegateEvents.apply(this, arguments);
			this.$el.draggable({
				handle: ".handle",
				containment: "document"
			});
			if(this.message) {
				var that = this;
				$("#chatroom").on("scroll", function() {
					onScroll.apply(that, arguments);
				});
			}
		},
		render: function() {
			template = template || _.template($("#template-panel").html());
			this.$el.empty().append(
				template({ 
					header: this.header || "",
					mode: this.getMode()
				}));
			
			var mode  = _.keys(Mode)[this.getMode()].toLowerCase();
			this.$el.attr("class", this.$el.attr("class").replace(/\bmode-\w+\b/g, ""));
			this.$el.addClass("mode-" + mode);
			if(this.getMode() == Mode.Panel) {
				this.$el.draggable("enable");
			} else {
				this.$el.draggable("disable");
			}

			this.$el.find(".modal-body").append(this.renderBody());
			if(this.width) {
				this.$el.css("width", (this.width + 31) + "px");
			}
			if(this.height) {
				this.$el.css("height", (this.height + 31) + "px");
			}

			onScroll.apply(this);

			return this;
		},
		renderBody: function() { return document.createElement("DIV"); }
	});

	
})();