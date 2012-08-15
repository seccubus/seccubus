steal('funcunit').then(function(){

module("Seccubus.Tabs", { 
	setup: function(){
		S.open("//seccubus/tabs/tabs.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Tabs Demo","demo text");
});


});