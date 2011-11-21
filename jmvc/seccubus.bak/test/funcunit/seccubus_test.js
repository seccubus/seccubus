steal("funcunit", function(){
	module("seccubus test", { 
		setup: function(){
			S.open("//seccubus/seccubus.html");
		}
	});
	
	test("Copy Test", function(){
		equals(S("h1").text(), "Welcome to JavaScriptMVC 3.2!","welcome text");
	});
})