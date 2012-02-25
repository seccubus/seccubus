steal('funcunit').then(function(){

module("Seccubus.Finding.Edit", { 
	setup: function(){
		S.open("//seccubus/finding/edit/edit.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Finding.Edit Demo","demo text");
});


});