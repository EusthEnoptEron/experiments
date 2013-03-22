App.UserCollection = Backbone.Collection.extend({
	model: App.User,
	url: "/users"
});

App.UserCollection.sync = function(method, model) {
  alert(method + ": " + model.url);
};
