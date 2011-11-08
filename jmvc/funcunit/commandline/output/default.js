(function(){
	var start = new Date();
	QUnitPrint = {
		begin: function(){
			
		},
		testStart: function(name){
			console.log("--" + name + "--")
		},
		log: function(result, message){
			if (!message) 
				message = ""
			console.log((result ? "  PASS " : "  FAIL ") + message)
		},
		testDone: function(name, failures, total){
			console.log("  done - fail " + failures + ", pass " + (total-failures) + "\n")
		},
		moduleStart: function(name){
			console.log("MODULE " + name + "\n")
		},
		moduleDone: function(name, failures, total){
		
		},
		browserStart : function(name){
			console.log("BROWSER " + name + " ===== \n")
		},
		browserDone : function(name, failed, total, formattedtime){
			console.log("\n"+name+" DONE " + failed + ", " + (total - failed) 
				+ ' - ' + formattedtime + ' seconds')
		},
		done: function(failed, total){
			var end = new Date(),
			totaltime = (end-start)/1000;
			console.log("\nALL DONE - fail " + failed + ", pass " + (total - failed)
				+ ' - ' + totaltime + ' seconds')
		}
	};
	
	var evts = ['browserStart', 'browserDone', 'testStart', 'testDone', 
				'moduleStart', 'moduleDone', 'done', 'log'];
	
	for (var i = 0; i < evts.length; i++) {
		type = evts[i];
		(function(type){
			// default method
			FuncUnit[type] = function(){
				QUnitPrint[type].apply(null, arguments)
			}
		})(type)
	}
	
	/**
	Users can override these methods with their own.  By default they just call QUnitPrint:
	
	FuncUnit.browserStart = function(browser)
	FuncUnit.browserDone = function(browser, failures, total, duration)
	FuncUnit.log = function(result, message)
	FuncUnit.testStart = function(name)
	FuncUnit.testDone = function(name, failures, total)
	FuncUnit.moduleStart = function(name)
	FuncUnit.moduleDone = function(name, failures, total)
	FuncUnit.done = function(failures, total)
	*/
	
})()