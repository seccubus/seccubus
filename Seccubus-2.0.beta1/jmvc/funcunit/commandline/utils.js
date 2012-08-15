steal(function(){	
	if (typeof FuncUnit == 'undefined') {
		FuncUnit = {};
	}
	if(!FuncUnit.loader){
		FuncUnit.loader = {};
	}
}, 
	'funcunit/commandline/events.js', function(){
	
	/**
	 * 2 ways to include settings.js:
	 * 1. Manually before funcunit.js 
	 * 2. FuncUnit.load will try to load settings.js if there hasn't been one loaded
	 */
	FuncUnit._loadSettingsFile = function(page){
		var dirArr = page.split("/")
		
		dirArr = dirArr.slice(0, dirArr.length - 1);
		dirArr.push("settings.js");
		var settingsPath = dirArr.join("/");
			
		// if settings.js was already loaded, don't try to load it again
		if (FuncUnit.browsers === undefined) {
			var backupFunc = FuncUnit;
			
			if(readFile('funcunit/settings.js')){
				load('funcunit/settings.js')
			}
			
			// try to load a local settings
			var foundSettings = false;
			if(/^http/.test(settingsPath)){
				try {
					readUrl(settingsPath)
					foundSettings = true;
				} 
				catch (e) {}
			}else{
				if(readFile(settingsPath)){
					foundSettings = true;
				}
			}
			
			if (foundSettings) {
				print("Reading Settings From "+settingsPath)
				load(settingsPath)
			}else{
				print("Using Default Settings")
			}
			
			steal.extend(FuncUnit, backupFunc)
			
			// since this has to load at a weird time, we will load any output formatters that are 
			// specified in this setting
			var output = 'funcunit/commandline/output/default.js'
			if (FuncUnit.output) {
				output = 'funcunit/commandline/output/'+FuncUnit.output+'.js'
			}
			load(output)
			
		}
	}
	
	FuncUnit._getPageUrl = function(page, coverage){
		if(!/https?:|file:/.test(page)){ // if theres no protocol, turn it into a filesystem urls
			var cwd = (new java.io.File (".")).getCanonicalPath();
			if(coverage){
				page = "file://"+cwd+"/instrumented/"+page;
			} else {
				page = "file://"+cwd+"/"+page;
			}
		}
		
		//convert spaces to %20.
		var newPage = /https?:/.test(page) ? page: page.replace(/ /g,"%20");
		
		// insert /instrumented
		// TODO this only works if you use an http url and the root domain is the jmvc root
		if(/https?:/.test(page) && coverage){
			var newPageMatch = newPage.match(/(https?\:\/\/[^\/]*\/)(.*)/);
			newPage = newPageMatch[1]+"instrumented/"+newPageMatch[2];
		}
		
		return newPage;
	}
})