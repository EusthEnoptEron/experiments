var http = require('http'),
	Canvas = require("canvas"),
	Image = Canvas.Image,
	fs = require('fs'),
	crypto = require("crypto"),
	async = require("async"),
	wrapText = require("./helpers.js").wrapText,
	shuffleArray = require("./helpers.js").shuffleArray,
	Promise = require("promise");

function loadImage(url) {
	return new Promise(function(resolve, reject) {
		var cacheDir = __dirname + "/../cache";
		var hash = crypto.createHash('md5').update(url).digest("hex"),
			  path = cacheDir + "/" + hash,
			  img  = new Image;
		if(!fs.existsSync(cacheDir)) {
			fs.mkdirSync(cacheDir);
		}

		fs.exists(path, function(exists) {
			if(exists) {

				fs.readFile(path, function(err, buffer) {

					img.src = buffer;
					resolve(img);
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
								// Load from cache
								loadImage(url).then(resolve);
							}
						})
					})
				});
			}
		});
	});
	
}

exports.drawCovers = function(novels, out, opts) {
	var rows = Math.min(opts.maxRows, novels.length / opts.maxCols);
	if(opts.onlyFullRows) rows = Math.floor(rows);
	else rows = Math.ceil(rows);
	var width  = opts.maxCols * (opts.imgWidth + opts.margins);
	var height = rows * (opts.imgHeight + opts.margins)

	// creating an image
	var canvas = new Canvas(width, height),
	ctx    = canvas.getContext("2d");

	ctx.fillStyle = opts.background;

	ctx.fillRect(0, 0, width, height);
	
	
	if(opts.shuffle)
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
		var col = i % opts.maxCols;
		var row = Math.floor(i / opts.maxCols);
		// Load image
		
		loadImage(novel.url)
		.then(function(img) {

			toLoad--;
			var x = col * (opts.imgWidth + opts.margins),
				y = row * (opts.imgHeight + opts.margins);

			if(opts.border) {
				ctx.save();
					ctx.fillStyle = opts.border;
					ctx.fillRect(x,
				               y,
				               opts.imgWidth,
				               opts.imgHeight);
				ctx.restore();
			}
			// Draw image
			ctx.globalAlpha = 1;
			ctx.drawImage(
				img,
				x + opts.paddings,
				y + opts.paddings,
				opts.imgWidth - opts.paddings * 2,
				opts.imgHeight - opts.paddings * 2);

			if(opts.text) {
				ctx.globalAlpha = 0.8;

				ctx.fillRect(x,
				           y + opts.imgHeight * 0.8,
				           opts.imgWidth,
				           opts.imgHeight * 0.2);
				ctx.globalAlpha = 1;
			
				ctx.save();
					ctx.lineWidth = 2;
					ctx.font = "12px " + opts.font;
					ctx.fillStyle = "#FFFFFF";
					wrapText(ctx, novel.name, x + opts.imgWidth/2, y + opts.imgHeight * .8, opts.imgWidth - opts.paddings * 2, 15);
				ctx.restore();
			}

			if(opts.border) {
				ctx.save();
					ctx.strokeStyle = opts.border;
					ctx.strokeRect(x,
				           y,
				           opts.imgWidth,
				           opts.imgHeight);
				ctx.restore();
			}

			if(!toLoad) {
				var stream;
				if(opts.format == "png") {
					stream = canvas.createPNGStream({
						bufsize : 2048
					}); 
				} else {
					stream = canvas.createJPEGStream({
						bufsize : 2048,
						quality : 80
					});
				}
				stream.pipe(out);
			}
		});
	});
}