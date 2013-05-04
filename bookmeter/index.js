var http = require('http'),
	cheerio = require('cheerio'),
	gm = require('gm');

var url_base = "http://book.akahoshitakuya.com/u/49530/booklist",
	novels   = [ 'http://ecx.images-amazon.com/images/I/51MpqVEGwKL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51ruDFB9YEL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51NstvzG6HL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51FMLmKV6wL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/61yM6z%2BGMOL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51hzASCW9cL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/41hEF2Df%2B4L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51Nz1yKr6zL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51kjZmly4EL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/61ku1LvPmhL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51-cr25R-eL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51mIpk3ZBDL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51Ddk1bcvyL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/512Dx0M07SL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51iG1td4y4L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/61wWXXm9phL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51lLUg1t2dL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/41K-KhHKkVL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51ado%2BKu9gL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/61rVAjBQe9L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51%2Bltr%2BDwvL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51gxzbxbzvL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51toEHArjsL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51KC%2BkoN7%2BL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/41fA64nnj7L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/516fqUKmXZL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51cQLQvWvEL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/510PIV9E2HL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51nh9iijyuL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51RnpnGUmfL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51jc3WSmiML._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51gO3LkCqwL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51EVypBpUSL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51308eIzCfL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51vAcw7AbvL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51rS0iQ-jxL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51Yq0EImjFL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51h9BScAaRL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/516sOzGWPCL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51GKdRJrNhL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51UOxn-lQEL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51q97du%2BFTL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51kcwmcHmML._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51V28xFjqTL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51w-2CCXxEL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51an%2BsIkakL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51n4NsugcUL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/61qm-4nRf6L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51LQlSfirDL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51EQCZ4WQAL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/510uwzP9g9L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/5140wBv50DL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51oA5yE7ICL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51oImxXCZdL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51X0-GcSPsL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/61Gwvsjz%2ByL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/5196-AH02sL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51N6cEMlnQL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51aIWVt1FHL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51j%2BIZDlv4L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51CopnGJNsL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51Zp2%2B7eKyL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51p-PKP6z0L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51umVifXDoL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/5170VWKTpgL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51KcHjla1mL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51xOCZpn%2B8L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51VQIrxZIXL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51qK%2BNMGl1L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51SyNVoN7vL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51uocLGFMOL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51rsLrYMm9L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51pnfaXFG3L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51iCmOsmD4L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51x9OF4r2qL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51g2R4iLylL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51Gilow3rEL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/510QELHN0EL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51ybDX45ycL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51RCYTpUVdL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51AGz-YWxaL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51gLuGWoTaL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51jCBRUsQYL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51R2E-ylWhL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51RQ47FC49L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51RfyaYGPJL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51HvZBYjXXL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51EJbGvQAlL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51-JoTPdA0L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/513c3vmAtlL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/31DNW6QD91L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/513SY8ZHDDL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51jYhlT4CJL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51D2V5BH0ZL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/514geJcznIL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51HmWCQKooL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/513Aypy6qwL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51RobwQNeEL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51K16JxZ4fL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51vAcw7AbvL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/61pRbQ%2BoGPL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51NhGISkIaL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51LOqr2yfhL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51EEKKRG62L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51xaQYIGxtL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51yrQzHAK6L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51gzkV-DVgL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51Mei-%2BWSfL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51IiMTFZQ4L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/61MGl3ydw0L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/512fSbQmSvL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/41Xgx3oJfqL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/419BSNHZ4NL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/516H4XQVRHL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51G5jes6fZL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51kvGI4vJcL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51tDqapF3gL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51NgssL3F8L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51mgBXixICL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51drOLhajjL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/61NUprzUTUL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51H96iFIOUL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51APBZuAriL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51zmL7MxXFL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51H96iFIOUL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/41MMOI5JHBL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/21V9GARCKGL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/514WSOZTwWL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/5184cFht6jL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51GL6UUXmSL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51BYhfHwF-L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/510p4FENXtL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51m2nxHe6DL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51cc9osLXWL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51cZQSzSAsL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51C0EhaQXnL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51p-JgdXvtL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51KiYy0kHsL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51e9lNDrxuL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51XTaUtsLdL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51du9%2BZaB2L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/518FiaArW8L._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51XSTotxvzL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51lvxPASBsL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51CzD1SWbDL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/515r%2Bw3G6EL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51m2nxHe6DL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51p-JgdXvtL._SL150_.jpg',
  'http://ecx.images-amazon.com/images/I/51DxWIpeRXL._SL150_.jpg' ];


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
			var req = http.get(url_base + "&p=" + $(this).text().trim() );
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

function finish() {
	// creating an image
	gm(200, 400, "#ddff99f3")
	.drawText(10, 50, "from scratch")
	.write("D:/text.jpg", function (err) {
	 	console.log(err);
	});
}


// http.get(url_base).on("response", fetchPages)
//                   .on("response", parsePage);
finish();