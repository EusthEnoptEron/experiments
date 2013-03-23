
/**
 * Module dependencies.
 */

var express = require('express')
	, connect = require('connect')
	, routes = require('./routes')
	, user = require('./routes/user')
	, http = require('http')
	, path = require('path')
	, app = express();

var cookieParser = express.cookieParser('uchuujindesu')
	, sessionStore = new connect.middleware.session.MemoryStore();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(cookieParser);
	app.use(express.session({ store: sessionStore })); 
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});
app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);


var server = http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);

var SessionSockets = require('session.socket.io')
	, ssio = new SessionSockets(io, sessionStore, cookieParser);



var users = [];
var id_seed = 0;

app.set("users", users);

ssio.on('connection', function (err, socket, session) {
	if(err) return;

	var logged = false;
	function login(success) {
		if(!logged) {
			logged = true;
			socket.emit("login", {
				name: session.user,
				success: success
			});
			// io.sockets.emit("user_list", users);
			io.sockets.emit("user_joins", session.user);

			if(users.indexOf(session.user) == -1)
				users.push(session.user);
		}
	}

	// HANDLE MESSAGES
	socket.on("post", function(data) {
		if(session.user) {
			data.name = session.user;
			socket.broadcast.emit("post", data);
		}
	});

	// HANDLE CANVAS
	socket.on("request_canvas", function() {
		var id = "c_" + (id_seed++);
		io.sockets.emit("canvas_action", {
			id: id,
			action: "create"
		});
	});

	socket.on("canvas_action", function(config) {
		socket.broadcast.emit("canvas_action", config);
	});

	// HANDLE LOGIN
	socket.on("login", function(name) {
		var success = false;

		if(!session.user) {
			if(users.indexOf(name) == -1) {
				success = true;
				session.user = name;
				session.save();
			}
		}
		login(success);
	});

	// HANDLE DISCONNECT
	socket.on('disconnect', function() {
		var i = users.indexOf(session.user);
		users.splice(i,1);
		io.sockets.emit("user_leaves", session.user);
	});


	// CONSTRUCTOR
	if(session.user) {
		login(true);
	}
	socket.emit("handshake", {
		newUser: session.user ? false : true
	});

});
