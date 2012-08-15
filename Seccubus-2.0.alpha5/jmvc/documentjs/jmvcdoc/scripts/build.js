load("steal/rhino/rhino.js");
steal('steal/build', 'steal/build/scripts', function() {
	steal.build('documentjs/jmvcdoc/jmvcdoc.html', {
		to: 'documentjs/jmvcdoc'
	});
});