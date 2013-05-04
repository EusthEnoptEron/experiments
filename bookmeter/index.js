var http = require('http'),
	cheerio = require('cheerio'),
	Canvas = require("canvas"),
	Image = Canvas.Image,
	fs = require('fs'),
	crypto = require("crypto");

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffleArray(o){ //v1.0
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

var urlBase = "http://book.akahoshitakuya.com/u/49530/booklist",
	maxCols = 10,
	maxRows = 6,
	margins  = 20,
	shuffle  = false,
	onlyFullRows = true,
	imgWidth   = 107,
	imgHeight  = 150,
	background = "#FFFFFF",//"#6BAF79",
	novels = [];


// var observer = new (function() {
// 	this.add = function() {

// 	}
// 	this.remove = function() {

// 	}
// })();

function getCheerio(res, callback) {
	res.setEncoding('utf8');
	var body = "";
	res.on('data', function (chunk) {
		body += chunk;
	});
	res.on("end", function() {
		callback(cheerio.load(body));
	});
}

function fetchPages(res) {
	getCheerio(res, function($) {
		var pages = [];
		var p = $(".page_navis span.now_page");
		while((p = p.next().filter(":not(.page_navi_hedge)")).length) {
			pages.push(p);
		}

		$(pages).each(function(i) {
			var req = http.get(urlBase + "&p=" + $(this).text().trim() );
			req.on("response", parsePage);

			if(i == pages.length - 1) {
				// Fetch next set of books
				req.on("response", fetchPages);
			}
		});

		if(pages.length == 0) {
			finish();
		}
	});
}

function parsePage(res) {
	getCheerio(res, function($) {
		$(".book_box_book_image img").each(function() { 
			novels.push($(this).attr("src")); 
		});
	});
}

function loadImage(url, callback) {
	var hash = crypto.createHash('md5').update(url).digest("hex"),
		  path = __dirname + "/cache/" + hash,
		  img  = new Image;
	if(!fs.existsSync(__dirname + "/cache")) {
		fs.mkdirSync(__dirname + "/cache");
	}

	fs.exists(path, function(exists) {
		if(exists) {
			fs.readFile(path, function(err, buffer) {
				img.src = buffer;
				callback(img);
			});
		} else {
			http.get(url, function(res) {
				var imagedata = '';
				res.setEncoding('binary');

				res.on('data', function(chunk){
	    		imagedata += chunk
				})

				res.on('end', function(){
					fs.writeFile(path, imagedata, 'binary', function(err){
						if(!err) {
							loadImage(url, callback);
						}
					})
				})
			});
		}
	});
}

function finish() {
	var out = fs.createWriteStream(__dirname + '/text.jpg');

	var width  = maxCols * (imgWidth + margins);
	
	var rows = Math.min(maxRows, novels.length / maxCols);
	if(onlyFullRows) rows = Math.floor(rows);
	else rows = Math.ceil(rows);

	var height = rows * (imgHeight + margins)
	// creating an image
	var canvas = new Canvas(width, height),
	ctx    = canvas.getContext("2d");
	ctx.fillStyle = background;
	ctx.fillRect(0, 0, width, height);
	if(shuffle)
		novels = shuffleArray(novels);

	var toLoad = novels.length;
	ctx.lineJoin    ="round";
	ctx.lineWidth = 5;
	ctx.strokeStyle = "#777";
	novels.forEach(function(url, i) {
		var col = i % maxCols;
		var row = Math.floor(i / maxCols);

		loadImage(url, function(img) {
			toLoad--;
			ctx.globalAlpha = 0.8;
			ctx.drawImage(
				img,
				col * (imgWidth + margins),
        row * (imgHeight + margins),
        imgWidth,
        imgHeight);
				ctx.globalAlpha = 1;
			ctx.strokeRect(col * (imgWidth + margins),
		               row * (imgHeight + margins),
		               imgWidth,
		               imgHeight);

			if(!toLoad) {
				canvas.createJPEGStream({
					bufsize : 2048,
    			quality : 60
				}).pipe(out);
			}
		});
	});

}


http.get(urlBase).on("response", fetchPages)
                  .on("response", parsePage);
// finish();