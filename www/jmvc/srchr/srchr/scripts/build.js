//steal/js srchr/scripts/compress.js
load("steal/rhino/steal.js");
steal.plugins('steal/build', 'steal/build/scripts', 'steal/build/styles', function() {
	steal.build('srchr/srchr.html', {
		to: 'srchr'
	});
});