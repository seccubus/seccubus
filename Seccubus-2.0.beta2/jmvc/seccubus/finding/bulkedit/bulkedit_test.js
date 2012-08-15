steal('funcunit').then(function(){

module("Seccubus.Finding.Bulkedit", { 
	setup: function(){
		S.open("//seccubus/finding/bulkedit/bulkedit.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Finding.Bulkedit Demo","demo text");
});


});