steal('steal/browser/envjs', './utils.js', function(){
	FuncUnit.loader.envjs = function(page){
		FuncUnit._loadSettingsFile(page)
		FuncUnit.funcunitPage = page;
		FuncUnit.browser = new steal.browser.envjs({
			fireLoad: true
		});
		
		FuncUnit.bindEvents(FuncUnit.browser);
		FuncUnit.browser.open(FuncUnit.funcunitPage);
	}
})