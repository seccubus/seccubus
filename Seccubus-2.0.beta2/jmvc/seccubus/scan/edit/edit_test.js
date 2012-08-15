steal('funcunit').then(function(){

module("Seccubus.Scan.Edit", { 
	setup: function(){
		S.open("//seccubus/scan/edit/edit.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Scan.Edit Demo","demo text");
});


});