steal('funcunit').then(function(){

module("Seccubus.Finding.Filter", { 
	setup: function(){
		S.open("//seccubus/finding/filter/filter.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Finding.Filter Demo","demo text");
});


});
