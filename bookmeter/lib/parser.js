/**
 * A simple parser for bookmeter pages.
 */


module.exports = {
	getNovels: function($) {
		var novels = [];

		$(".book").each(function() {
			novels.push({
				url: $(this).find(".book_box_book_image img").attr("src"),
				name: $(this).find(".book_box_book_title").text().match(/^[^(]+/)[0].trim()
			});
		});

		return novels;
	},
	getPages: function($) {
		var pages = [];
		// Start at the current page indicator and process the next() until we 
		// hit on .page_navi_hedge
		var p = $(".page_navis span.now_page");

		while((p = p.next().filter(":not(.page_navi_hedge)")).length) {
			pages.push($(p).text().trim());
		}
		return pages;
	}
};