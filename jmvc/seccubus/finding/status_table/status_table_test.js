steal('funcunit').then(function(){

module("Seccubus.Finding.Table", { 
	setup: function(){
		S.open("//seccubus/finding/status_table/status_table.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Finding.Table Demo","demo text");
});


});
