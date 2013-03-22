
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
var io = require('socket.io');



app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
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

var users = [];

io.listen(server).sockets.on('connection', function (socket) {
  socket.on("post", function(data) {
    socket.get("nick", function(err, name) {
      if(!err) {
        data.name = name;
        socket.broadcast.emit("post", data);
      }
    });
  });
  socket.on("login", function(name) {    
    var res = {
      success: false,
      name: name
    };
    if(users.indexOf(name) == -1) {
      res.success = true;
      socket.set("nick", name);
      users.push(name);
    }
    socket.emit("login", res);
  });
});
