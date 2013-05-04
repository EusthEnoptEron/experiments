var _ = require("underscore");
/*
 * GET users listing.
 */

exports.list = function(req, res){
  // res.writeHead(200, { 'Content-Type': 'application/json' });
  var json = [];
  _.forEach(req.app.get("users"), function(vals, key) {
  	vals.name = key;
  	json.push(
  		vals
  	);
  });

  res.json(json);
  
  // res.render('index', { title: 'Express' });
  
};