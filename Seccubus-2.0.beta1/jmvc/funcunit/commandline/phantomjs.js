steal('steal/browser/phantomjs', './utils.js', function(){
	FuncUnit.loader.phantomjs = function(page){
		FuncUnit._loadSettingsFile(page);
		FuncUnit.funcunitPage = page;
		FuncUnit.browser = new steal.browser.phantomjs({
			// print: true
		});
		
		FuncUnit.bindEvents(FuncUnit.browser)
		FuncUnit.browser.open(FuncUnit.funcunitPage)
	}
})