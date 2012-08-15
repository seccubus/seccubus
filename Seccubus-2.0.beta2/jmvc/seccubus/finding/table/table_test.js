steal('funcunit').then(function(){

module("Seccubus.Finding.Table", { 
	setup: function(){
		S.open("//seccubus/finding/table/table.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Finding.Table Demo","demo text");
});


});