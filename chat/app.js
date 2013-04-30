
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


function extractCommands(data) {
	var cmds = [];
	// Search for commands
	if(~data.body.indexOf("[draw]")) {
		data.body = data.body.replace(/\[draw\]/g, "draw");
		cmds.push("draw");
	}
	if(~data.body.indexOf("[code]")) {
		data.body = data.body.replace(/\[code\]/g, "code");
		cmds.push("code");
	}
	return cmds;
}

var users = {};
var id_seed = 0;
var msg_id_seed = 0;
var msgCache = {};


app.set("users", users);

ssio.on('connection', function (err, socket, session) {
	if(err) return;
	console.log("CONNECT");
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

			if(!(session.user in users)) {
				users[session.user] = {
					viewport: []
				};
			}
		}
	}

	// HANDLE MESSAGES
	socket.on("post", function(data) {
		if(session.user) {
			data.name = session.user;
			data.id   = msg_id_seed++;
			var pid = data.p_id;
			
			var cmd = extractCommands(data).shift();

			switch(cmd) {
				case "draw":
					// Create a canvas
					var id = "c_" + (id_seed++);
					var obj = {
						id: id,
						action: "create",
						message: data.id
					};

					socket.broadcast.emit("post", data);
					socket.broadcast.emit("canvas_action", obj);
					obj.message = pid;
					socket.emit("canvas_action", obj);
					break;
				case "code":
					msgCache[data.id] = data;
					socket.emit("request_code", data.id);
					break;
				default:
					socket.broadcast.emit("post", data);
					break;
			}
		}
	});

	socket.on("post_code", function(token, values) {
		var post = msgCache[token];
		if(post) {
			socket.broadcast.emit("post", post);
			values.id = "c_" + (id_seed++);
			values.message = post.id;
			socket.broadcast.emit("pastebin:create", values);
			values.message = post.p_id;
			socket.emit("pastebin:create", values);
		}
	});

	socket.on("notify", function(data) {
		socket.broadcast.emit("user_notify", session.user, data);
	});

	socket.on("canvas_action", function(config) {
		socket.broadcast.emit("canvas_action." + config.id, config);
	});

	socket.on("pastebin:update", function(id, deltas) {
		socket.broadcast.emit("pastebin." + id + ":update", deltas);
	});



	// HANDLE LOGIN
	socket.on("login", function(name) {
		var success = false;

		if(!session.user) {
			if(!(name in users)) {
				success = true;
				session.user = name;
				session.save();
			}
		}
		login(success);
	});

	// HANDLE DISCONNECT
	socket.on('disconnect', function() {
		delete users[session.user];
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
