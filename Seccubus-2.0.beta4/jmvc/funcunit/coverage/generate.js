// TODO this only works if you use an http url and the root domain is the jmvc root
(function(){
	load('steal/rhino/rhino.js');
	steal('steal/rhino/file.js');
	var ignoreArr = [],
		opts;
	FuncUnit = {
		setCoverageOpts: function(o){
			opts = o;
		},
		_findTestFiles: function(path){
			var dirObj = new java.io.File(path),
				files = dirObj.listFiles(),
				file;
			for ( var i = 0; i < files.length; i++ ) {
				file = files[i];
				// if its already there, skip this path
				if(ignoreArr.indexOf(""+file.getPath()) != -1){
					continue;
				}
				if ( file.isDirectory() ) {
					// if its a test folder, ignore it and skip it
					if((""+file.name) === "test"){
						ignoreArr.push(file.getPath())
						
					} else {
						this._findTestFiles(file);
						continue;	
					}
				} else {
					if(/\_test\.js$/.test(file.name)){
						ignoreArr.push(file.getPath())
					}
				}
			}
		},
		_ignoreArray: function(){
			this._findTestFiles('.')
			for(var i=0; i<ignoreArr.length; i++){
				ignoreArr[i] = ignoreArr[i].substring(2)
			}
			return ignoreArr;
		},
		// jscoverage.exe ng-ui\src ng-ui\instrumented --no-instrument=steal --no-instrument=documentjs
		generateCoverage: function(){
			ignoreArr.push("./documentjs", "./jquery", "./steal", "./mxui")
			if(!opts.includeFuncunit){
				ignoreArr.push("./funcunit")
			}
			var rmCmd = "rm -Rf instrumented";
			if (java.lang.System.getProperty("os.name").indexOf("Windows") != -1) {
				// runCommand("cmd", "/C", command.replace(/\//g, "\\"))
			} else {
				print(rmCmd)
				runCommand("sh", "-c", rmCmd);
			}
			
			var ignore = this._ignoreArray(),
				noInstrument = [];
			
			for(var i=0; i<ignore.length; i++){
				noInstrument.push("--no-instrument="+ignore[i]);
			}
			var command = "jscoverage ./ ../instrumented --verbose "+noInstrument.join(" "),
				mvCmd = "mv ../instrumented instrumented";
			if (java.lang.System.getProperty("os.name").indexOf("Windows") != -1) {
				// runCommand("cmd", "/C", command.replace(/\//g, "\\"))
			} else {
				print(command)
				runCommand("sh", "-c", command);
				print(mvCmd)
				runCommand("sh", "-c", mvCmd);
			}
		},
		getTotalStats: function(data){
			var lines,
				totalLines = 0,
				totalLinesRun = 0,
				linesForFile,
				linesRun,
				pct,
				filePct,
				stats = {
					files: {}
				};
			for(var file in data){
				if(opts.ignore && opts.ignore.indexOf(file) !== -1){
					continue;
				}
				stats.files[file] = {
					lines: data[file]
				};
				linesForFile = 0;
				linesRun = 0;
				lines = data[file];
				for(var line in lines){
					if(lines[line] > 0){
						totalLinesRun++;
						linesRun++;
					} 
					if(typeof lines[line] === "number"){
						linesForFile++;
						totalLines++;
					}
				}
				filePct = Math.round((linesRun/linesForFile)* 10000)/100 + '%';
				stats.files[file].stats = {
					lines: linesForFile,
					linesRun: linesRun,
					pct: filePct
				}
			}
			pct = Math.round((totalLinesRun/totalLines)* 10000)/100 + '%';
			stats.total = {
				lines: totalLines,
				linesRun: totalLinesRun,
				pct: pct
			}
			return stats;
		}
	}
})()