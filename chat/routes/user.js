
/*
 * GET users listing.
 */

exports.list = function(req, res){
  // res.writeHead(200, { 'Content-Type': 'application/json' });
  var json = [];
  req.app.get("users").forEach(function(name) {
  	json.push({name: name});
  });

  res.json(json);
  
  // res.render('index', { title: 'Express' });
  
};