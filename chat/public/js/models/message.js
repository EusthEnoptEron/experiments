(function() {
var id_seed = 0;
App.Message = Backbone.Model.extend({
	initialize: function(props) {
		if(!("id" in props)) {
			this.set("id", "p_" + (id_seed++) );
		}
	},
	getId: function() {
		return "message_" + this.id;
	}	
});

})();