var program = require("commander"),
    mkdirp  = require("mkdirp"),
    http    = require("http"),
    fs      = require("fs");

// Set up program
program
	.option("-i, --in <json>", "input file location")
	.option("-o, --out [path]", "output location [.]", ".")
	.option("-t, --timeout [ms]", "timeout between fetches (0 for parallel)", Number, 1000)
	.parse(process.argv);

var illegalCharacters = ["\\","<",">","*","?","/","\"",":","|"];
function normalize(path) {
	illegalCharacters.forEach(function(letter) {
		path = path.split(letter).join("");
	});
	return path;
};

if(program.in) {
	// load json
	var data = JSON.parse(fs.readFileSync(program.in));
	
	// Make sure folder exists
	if(!fs.existsSync(program.out)) {
		mkdirp.sync(program.out);
	}

	function download() {
		var task = data.shift();
		if(task.name && task.url) {
			var suffix = task.url.match("\.\w+$");
			if(suffix) suffix = suffix[0];
			else suffix = ".jpg";
			var path = program.out + "/" + normalize(task.name + suffix);

			if(!fs.existsSync(path)) {
				console.log("download " + task.url + " > " + path);
				var out = fs.createWriteStream(path);
				http.get(task.url, function(res) {
					res.pipe(out);
				});

				if(program.timeout >= 0) {
					out.on("close", function() {
						setTimeout(download, program.timeout);
					});
				} else {
					download();
				}
			} else {
				download();
			}
		}
	}

	download();

} else {
	program.help();
}