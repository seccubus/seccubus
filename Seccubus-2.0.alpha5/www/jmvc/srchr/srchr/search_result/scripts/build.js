//steal/js srchr/search_result/scripts/compress.js
load("steal/rhino/steal.js");
steal.plugins('steal/build', 'steal/build/scripts', 'steal/build/styles', function() {
	steal.build('srchr/search_result/search_result.html', {
		to: 'srchr/search_result'
	});
});