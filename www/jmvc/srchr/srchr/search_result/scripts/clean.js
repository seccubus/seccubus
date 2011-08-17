//steal/js srchr/search_result/scripts/compress.js
load("steal/rhino/steal.js");
steal.plugins('steal/clean', function() {
	steal.clean('srchr/search_result/search_result.html', {
		indent_size: 1,
		indent_char: '\t'
	});
});