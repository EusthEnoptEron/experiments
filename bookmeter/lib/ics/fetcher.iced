# Libraries
Promise = require "promise"
Parser  = require "../parser"
cheerio = require "cheerio"
request = require "request"
http    = require "http"
fs      = require "fs"
_       = require "underscore"

# Defaults
defaults = 
	uid: 49530
	page: "booklist"
	baseUrl: "http://book.akahoshitakuya.com/u/"
	data: undefined


# Class definition
class Fetcher
	constructor: (options) ->
		@opt = _.defaults options, defaults
		@opt.url = @opt.baseUrl + @opt.uid + "/" + @opt.page

	fetch: (url, cb) =>
		await request url, defer err, response, body
		cb cheerio.load(body)

	fetchOld: (url, cb) =>
		
		# Wait for http request to end
		
		http.get(url).on "response", (res) ->
			res.setEncoding "utf8"
			body = ""

			res.on "data", (chunk) ->
				body += chunk

			# End http request
			await res.on "end", defer err
			
			cb cheerio.load(body)

	###
	Process a page number of the current fetcher task
	###
	process: (num, recursive, cb) =>
		url = @opt.url
		url += "&p=" + num if num

		await this.fetch url, defer $

		novels = [Parser.getNovels $]
		if recursive
			await
				pages = Parser.getPages $
				for pageNum, i in pages
					isLast = (i == pages.length - 1)
					this.process pageNum, isLast, defer novels[i+1]
		

		cb _.flatten(novels)


	fetchAll: (cb) =>
		if @opt.data
			# We've already got the needed data
			await fs.readFile @opt.data, defer err, data
			cb JSON.parse data
		else
			await this.process 0, true, defer novels
			cb novels



# Exports
exports.Fetcher = Fetcher
exports.fetch = (options) ->
	return new Promise (resolve, reject) ->
		(new Fetcher options).fetchAll (novels) ->
			resolve novels