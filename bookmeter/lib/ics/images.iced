shuffleArray = require("../helpers").shuffleArray
wrapText     = require("../helpers").wrapText
Promise      = require "promise"
Canvas       = require "canvas"
crypto       = require "crypto"
Image        = Canvas.Image
async        = require "async"
http         = require "http"
fs           = require "fs"

loadImage = (url, cb) ->
	# prepare variables
	cacheDir = __dirname + "/../../cache"
	filename = url.match /[^\/]+$/
	path = cacheDir + "/" + filename

	# check for cache dir
	await fs.exists cacheDir, defer exists
	if !exists
		await fs.mkdir cacheDir, defer err

	# check for image path
	await fs.exists path, defer exists
	if exists
		img = new Image
		fs.readFile path, (err, buffer) ->
			img.src = buffer
			cb img
	else
		http.get url, (res) ->
			data = ""
			res.setEncoding "binary"

			res.on "data", (chunk) ->
				data += chunk

			await res.on "end", defer err
			await fs.writeFile path, data, "binary", defer err
			await loadImage url, defer img
			cb img

exports.drawCovers = (novels, out, opts) ->
	rows = Math.min(opts.maxRows, novels.length / opts.maxCols)
	if opts.onlyFullRows
		rows = Math.floor rows
	else
		rows = Math.ceil rows

	width  = opts.maxCols * (opts.imgWidth + opts.margins)
	height = rows * (opts.imgHeight + opts.margins)

	novels = shuffleArray novels if opts.shuffle

	novels.reverse() if opts.reverse

	# creating an image
	canvas = new Canvas width, height
	ctx    = canvas.getContext "2d"
	ctx.fillStyle = opts.background
	ctx.fillRect(0, 0, width, height)
	ctx.lineJoin    ="round"
	ctx.strokeStyle = "rgb(63, 177, 185)"
	ctx.fillStyle = "rgb(111, 197, 203)"
	ctx.globalAlpha = 1
	ctx.lineWidth = 1
	ctx.textBaseline = "hanging"
	ctx.textAlign = "center"
	fontSize = (opts.imgWidth * opts.imgHeight * 0.2) / 1000
	imageSize = [ opts.imgWidth - opts.paddings * 2,
	 opts.imgHeight - opts.paddings * 2 ]
	# console.log fontSize
	await
		novels.forEach (novel, i) ->
			((autocb) ->
				col = i % opts.maxCols
				row = Math.floor(i / opts.maxCols)
				
				# Load image
				await loadImage novel.url, defer img

				ctx.beginPath()

				x = col * (opts.imgWidth + opts.margins)
				y = row * (opts.imgHeight + opts.margins)

				if(opts.border)
					ctx.save()
					ctx.fillStyle = opts.border
					ctx.fillRect(x,
					             y,
					             opts.imgWidth,
					             opts.imgHeight)
					ctx.restore()
				
				# Draw image
				ctx.globalAlpha = 1
				ctx.save()
				ctx.fillStyle = opts.background
				ctx.rect(
					x + opts.paddings,
				    y + opts.paddings,
				    imageSize[0],
				    imageSize[1]
				)
				ctx.fill()
				ctx.clip()

				ctx.drawImage(
				    img,
				    x + opts.paddings,
				    y + opts.paddings,
				    imageSize[1] / img.height * img.width,
				    imageSize[1] 
				)

				ctx.restore()

				if opts.text 
					ctx.globalAlpha = 0.8

					ctx.fillRect(x,
					          y + opts.imgHeight * 0.8,
					          imageSize[0],
					          imageSize[1] * 0.2)
					ctx.globalAlpha = 1
				
					ctx.save()
					ctx.lineWidth = 0.8
					ctx.font = fontSize + "px " + opts.font
					ctx.fillStyle = "#FFFFFF"
					ctx.strokeStyle = "black"
					wrapText(ctx, novel.name, x + opts.imgWidth/2, y + opts.imgHeight * .8, opts.imgWidth - opts.paddings * 2, fontSize + 3, false)
					ctx.restore()
				

				if opts.border
					ctx.save()
					ctx.strokeStyle = opts.border
					ctx.strokeRect(x,
					      y,
					      opts.imgWidth,
					      opts.imgHeight)
					ctx.restore()
			)(defer())


	stream = undefined
	if opts.format == "png"
		stream = canvas.createPNGStream
			bufsize : 2048
		
	else 
		stream = canvas.createJPEGStream
			bufsize : 2048
			quality : 80
		
	
	
	stream.pipe(out)