steal('funcunit').then(function(){

module("Seccubus.Scanner.Select", { 
	setup: function(){
		S.open("//seccubus/scanner/select/select.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Scanner.Select Demo","demo text");
});


});