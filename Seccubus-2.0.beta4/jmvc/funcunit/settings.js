FuncUnit = {
	// the list of browsers that selenium runs tests on
	// browsers: ["*firefox"],
	
	// the root for all paths in the tests, defaults to filesystem
	jmvcRoot: null, // "http://localhost:8000/",
	
	// the number of milliseconds between Selenium commands, "slow" is 500 ms
	speed: null, //"slow"
	
	// a script in funcunit/commandline/output that formats the output
	output: 'xunit',

	// the name of the file to save results to (only when using xunit formatter)
	xmlLogFilename: 'testresults.xml',  

	// a prefix for the xml log file classes
	xmlLogClassPrefix: 'Qunit.'
}