var http = require('http'),
	cheerio = require('cheerio'),
	Canvas = require("canvas"),
	Image = Canvas.Image,
	fs = require('fs'),
	crypto = require("crypto"),
	async = require("async");

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffleArray(o){ //v1.0
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

var urlBase = "http://book.akahoshitakuya.com/u/49530/booklist",
	maxCols = 15,
	maxRows = 30,
	margins  = 20,
	paddings  = 3,
	shuffle  = false,
	onlyFullRows = false,
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

function fetchPages(cb, $) {
	var pages = [];
	var p = $(".page_navis span.now_page");
	while((p = p.next().filter(":not(.page_navi_hedge)")).length) {
		pages.push(p);
	}
	var tasks = [];

	$(pages).each(function(i) {
		var el = this;
		tasks.push(function(callback) {
			var req = http.get(urlBase + "&p=" + $(el).text().trim() );
			var pp = parsePage;
		
			if(i == pages.length - 1) {
				// Fetch next set of books
				pp = pp.bind(null, true, callback);
			} else {
				pp = pp.bind(null, false, callback);
			}
			req.on("response", pp);
		});
	});
	async.parallel(tasks, cb);
}

function parsePage(fetch, cb, res) {
	getCheerio(res, function($) {
		$(".book").each(function() {
			novels.push({
				url: $(this).find(".book_box_book_image img").attr("src"),
				name: $(this).find(".book_box_book_title").text().match(/^[^(]+/)[0].trim()
			});
		});
		if(fetch) {
			fetchPages(cb, $);
		} else {
			cb();
		}
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
	var out = fs.createWriteStream(__dirname + '/paper.jpg');

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
	ctx.strokeStyle = "rgb(63, 177, 185)";
	ctx.fillStyle = "rgb(111, 197, 203)";
	ctx.globalAlpha = 1;
	ctx.lineWidth = 1;
	ctx.textBaseline="hanging";
	ctx.textAlign="center";

	novels.forEach(function(novel, i) {
		var col = i % maxCols;
		var row = Math.floor(i / maxCols);

		// Load image
		loadImage(novel.url, function(img) {
			toLoad--;
			var x = col * (imgWidth + margins),
				y = row * (imgHeight + margins);

			ctx.fillRect(x,
		               y,
		               imgWidth,
		               imgHeight);

			// Draw image
			ctx.globalAlpha = 1;
			ctx.drawImage(
				img,
				x + paddings,
				y + paddings,
				imgWidth - paddings * 2,
				imgHeight - paddings * 2);

			ctx.globalAlpha = 0.8;

			ctx.fillRect(x,
			           y + imgHeight * 0.8,
			           imgWidth,
			           imgHeight * 0.2);
			ctx.globalAlpha = 1;
			ctx.save();
			ctx.lineWidth = 2;
			ctx.font = "12px TakaoExMincho";
			ctx.fillStyle = "#FFFFFF";
			wrapText(ctx, novel.name, x + imgWidth/2, y + imgHeight * .8, imgWidth - paddings * 2, 15);
			ctx.restore();


			ctx.strokeRect(x,
			           y,
			           imgWidth,
			           imgHeight);


			if(!toLoad) {
				canvas.createJPEGStream({
					bufsize : 2048,
					quality : 80
				}).pipe(out);
			}
		});
	});

}


http.get(urlBase).on("response", parsePage.bind(null, true, finish));
// finish();




function wrapText(context, text, x, y, maxWidth, lineHeight) {
	var words = text.split('');
	var line = '';

	for(var n = 0; n < words.length; n++) {
	  var testLine = line + words[n] + ' ';
	  var metrics = context.measureText(testLine);
	  var testWidth = metrics.width;
	  if(testWidth > maxWidth) {
	    context.fillText(line, x, y);
	    line = words[n] + ' ';
	    y += lineHeight;
	  }
	  else {
	    line = testLine;
	  }
	}
	context.fillText(line, x, y);
}
