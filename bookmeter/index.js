var fs = require('fs'),
	program = require("commander"),
	fetch = require("./lib/fetcher.js").fetch,
	drawCovers = require("./lib/images.js").drawCovers;

program
	.usage("[options] <output.jpg>")
	.option("-u, --uid []", "User ID", 49530)
	.option("--page []", "Page to fetch from [booklist]", "booklist")
	.option("--maxCols []", "Max number of columns", 15)
	.option("--maxRows []", "Max number of rows", 30)
	.option("-m, --margins []", "margin width in pixels", 20)
	.option("-p, --paddings []", "padding with in pixels", 3)
	.option("-s, --shuffle []", "shuffle novels or not")
	.option("--onlyFullRows []", "allow only for full rows or not")
	.option("-w, --imgWidth []", "width of each cover", 107)
	.option("-h, --imgHeight []", "height of each cover", 150)
	.option("--background []", "background color", "#FFFFFF")
	.parse(process.argv);

if(program.args.length) {
	fetch({
		uid: program.uid,
		page: program.page
	})
	.then(function(novels) {
		var out = fs.createWriteStream(program.args[0]);
		drawCovers(novels, out, program);
	});
} else {
	program.outputHelp();
}

