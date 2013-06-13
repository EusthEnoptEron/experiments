var Promise = require('promise'),
	Parser  = require("./parser.js"),
	cheerio = require('cheerio'),
	http    = require('http'),
	_       = require("underscore");


var defaults = {
	uid: 49530,
	page: "booklist",
	baseUrl: "http://book.akahoshitakuya.com/u/"
};


var Fetcher = exports.Fetcher = function(options) {
	options = options || {};
	this.opt = _.defaults(options, defaults);
	this.opt.url = this.opt.baseUrl + this.opt.uid + "/" + this.opt.page;

	this.i = 0;
	this.novels = [];
	this.results = {};
}

Fetcher.prototype.fetch = function(url) {
	return new Promise(function(resolve, reject) {
		http.get(url).on("response", function(res) {
			res.setEncoding('utf8');
			var body = "";
			res.on('data', function (chunk) {
				body += chunk;
			});
			res.on("end", function() {
				resolve(cheerio.load(body));
			});
		});
	});
};
Fetcher.prototype.register = function(url) {
	this.i++;
	this.results[url] = [];
};

Fetcher.prototype.unregister = function(url, novels) {
	this.i--;
	this.results[url].push(novels);

	if(this.i == 0) {
		this.resolve(_.flatten(_.values(this.results)));
	}
};


/**
 * Process a page number of the current fetcher task.
 * @param  {[type]} num       Page number to process
 * @param  {[type]} recursive Whether or not to continue fetching as long as
 * there are results. If you want to do this, use fetchAll() instead.
 * @return {[type]} a promise you can use to access the resulting novels.
 */
Fetcher.prototype.process = function(num, recursive) {
	var url = this.opt.url;
	var self = this;
	return new Promise(function(resolve, reject) {
		if(num) url += "&p=" + num;

		self.register(url);
		self.fetch(url)
		.then(function($) {
			var novels = Parser.getNovels($);
			if(recursive) {
				var pages  = Parser.getPages($);
				_.each(pages, function(pageNum, i) {
					var isLast = i == pages.length - 1;
					self.process(pageNum, isLast).then(null, self.reject);
				});
			}
			return novels;
		}, reject)
		.then(function(novels) {
			resolve(novels);
			self.unregister(url, novels);
		}, reject);
	});
};


/**
 * Fetch all novels
 * @return {[type]} [description]
 */
Fetcher.prototype.fetchAll = function() {
	var self = this;
	return new Promise(function(resolve, reject) {
		self.resolve = resolve;
		self.reject = reject;

		self.process(0, true).then(null, self.reject);
	});
};


exports.fetch = function(options) {
	return (new Fetcher(options)).fetchAll();
};

