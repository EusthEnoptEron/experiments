(function() {$
	var TIMEOUT = 2000;

	App.PastebinView = App.PanelView.extend({
		events: {
			"resize .modal-body": "resize"
		},
		initialize: function() {
			if(!this.id)
				this.id = this.model.id;

			var id = this.model.id;
			var that = this;
			var body = this.renderBody();

			this.timeout = null;
			this.header = "Pastebin";

			var editor = this.editor = ace.edit(body);
		  editor.setTheme("ace/theme/monokai");
		  editor.getSession().setMode("ace/mode/" + this.model.get("language"));

			editor.getSession().on("change", function(e) {
				if(!that.updating)
					App.socket.emit("pastebin:update", id, [e.data]);
			});

			this.editor.setValue(this.model.get("code"));
			App.socket.on("pastebin." + this.model.id + ":update", this.updateCode.bind(this));
		},
		// Handle pastebin input from the other side.
		updateCode: function(deltas) {
			this.updating = true;
			this.editor.getSession().getDocument().applyDeltas(deltas);
			this.updating = false;

			// Enable read only for a while
			editor.setReadonly(true);

			clearTimeout(this.timeout);
			var editor = this.editor;
			this.timeout = setTimeout(function() {
				// Make editable again
				editor.setReadonly(false);
			}, TIMEOUT);
		},
		renderBody: function() {
			if(!this.body) {
				var body = this.body = document.createElement("DIV");
				body.className = "editor";
				body.style.height = "200px";
				body.style.width = "400px";

			}
			return this.body;
		},
		resize: function() {
			$(this.renderBody()).css("height", this.$(".modal-body").height());
			this.editor.resize();
		}
	});
})();