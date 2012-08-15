steal("funcunit").then(function(){

	module("autosuggest",{
		setup: function() {
			S.open('autosuggest.html')
		}
	});
	
	test("results appear",function(){
		S('input').visible().click().type("Java")
	
		// wait until we have some results
		S('.ui-menu-item').visible(function(){
			equal( S('.ui-menu-item').size(), 2, "there are 2 results")
		})
	});
	
	test("clicking result",function(){
		S('input').visible().click().type("JavaS")
		
		S('.ui-menu-item a:first').visible()
		S('body').move('.ui-menu-item a:first')
		S('.ui-menu-item a:first').visible().click()
		S('input').val("JavaScript");
    })



})