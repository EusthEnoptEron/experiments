(function() {
	var template = null;
	var defaults;

	App.PanelView = Backbone.View.extend({
		className: "panel",
		_configure: function(options) {
			Backbone.View.prototype._configure.apply(this, arguments);
			_.extend(this, _.pick(options, _.keys(defaults)));

			_.forEach(defaults, function(val, key) {
				//TODO: maybe use isLocalProperty?
				if(!(key in this)) {
					this[key] = val;
				}
			});
		},
		delegateEvents: function() {
			Backbone.View.prototype.delegateEvents.apply(this, arguments);
			this.$el.draggable({
				handle: ".handle",
				containment: "document"
			});
		},
		render: function() {
			template = template || _.template($("#template-panel").html());
			this.$el.empty().append(template({ header: this.header || ""}));
			this.$el.find(".modal-body").append(this.renderBody());
			if(this.width) {
				this.$el.css("width", (this.width + 31) + "px");
			}
			if(this.height) {
				this.$el.css("height", (this.height + 31) + "px");
			}
			return this;
		},
		renderBody: function() { return document.createElement("DIV"); }
	});

	App.PanelView.Mode = {
		Docked: 0,
		Panel: 2
	};

	defaults = {
		header: "",
		body: "",
		mode: App.PanelView.Mode.Panel
	};
})();