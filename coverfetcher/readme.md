# CoverFetcher
## Usage
```
Usage: fetcher.js [options]

Options:

  -h, --help          output usage information
  -i, --in <json>     input file location
  -o, --out [path]    output location [.]
  -t, --timeout [ms]  timeout between fetches (0 for parallel)
```

## Populate
Snippet to get a list of all covers on bookwalkers.jp:
```javascript
JSON.stringify(
	$(".image > a > img").map(function() { 
		return { 
			name: $(this).closest(".itemWrap").find(".title a").text(),
			url: "http://cc.bookwalker.jp/coverImage_" + (this.src.match(/\d+(?=\.jpg)/)*1-1) + ".jpg"
		}
	}).get()
);
```

...or in one line:
`JSON.stringify($(".image > a > img").map(function() { return { name: $(this).closest(".itemWrap").find(".title a").text(), url: "http://cc.bookwalker.jp/coverImage_" + (this.src.match(/\d+(?=\.jpg)/)*1-1) + ".jpg"} } ).get());`