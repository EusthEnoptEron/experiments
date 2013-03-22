
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

ssio.on('connection', function (err, socket, session) {
  if(err) return;
  var user = session.user;

  socket.on("post", function(data) {
    if(user) {
      data.name = user;
      socket.broadcast.emit("post", data);
    }
  });
  socket.on("login", function(name) {
    var res = {
      success: false,
      name: name
    };
    if(!user) {
      if(users.indexOf(name) == -1) {
        res.success = true;
        session.user = name;
        session.save();
        users.push(name);
      }
    }
    socket.emit("login", res);
  });

  if(user) {
    socket.emit("login", {
      success: true,
      name: user
    })
  }
  socket.emit("handshake", {
    newUser: user ? false : true
  });

});
