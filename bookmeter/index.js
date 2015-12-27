require("iced-coffee-script");
//require("iced-coffee-script/register");
require('kal');

var fs = require('fs'),
	program = require("commander"),
	fetch = require("./lib/ics/fetcher").fetch,
	drawCovers = require("./lib/ics/images").drawCovers;


program
	.usage("[options] <output>")
	.option("-f, --format []", "file format [jpg|png|json]", "jpg")
	.option("-i, --data []", "load data from json file")
	.option("-u, --uid []", "user ID", Number, 49530)
	.option("--page []", "page to fetch from [booklist]", "booklist")
	.option("--maxCols []", "max number of columns", Number, 15)
	.option("--maxRows []", "max number of rows", Number, 30)
	.option("-m, --margins []", "margin width in pixels", Number, 20)
	.option("-p, --paddings []", "padding with in pixels", Number, 3)
	.option("-s, --shuffle", "shuffle novels or not")
	.option("--onlyFullRows", "allow only for full rows or not")
	.option("-w, --imgWidth []", "width of each cover", Number, 107)
	.option("-h, --imgHeight []", "height of each cover", Number, 150)
	.option("--background []", "background color", "#000000")
	.option("--font []", "font to be used", "TakaoExMincho")
	.option("--reverse", "reverse image order")
	.option("-t, --text", "display text or not")
	.option("-b, --border []", "border color if there should be one", String)
	.parse(process.argv);

// console.log(program);
if(program.args.length) {
	fetch({
		uid: program.uid,
		page: program.page,
		data: program.data
	})
	.then(function(novels) {
		var out = fs.createWriteStream(program.args[0]);
		switch(program.format) {
			case "json":
				out.write(JSON.stringify(novels));
				out.end();
				break;
			default:
				drawCovers(novels, out, program);
		}
	});
} else {
	program.outputHelp();
}

