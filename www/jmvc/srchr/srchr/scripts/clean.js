//steal/js srchr/scripts/compress.js
load("steal/rhino/steal.js");
steal.plugins('steal/clean', function() {
	steal.clean('srchr/srchr.html', {
		indent_size: 1,
		indent_char: '\t'
	});
});