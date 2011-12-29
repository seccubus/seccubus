steal('funcunit').then(function(){

module("Seccubus.Finding.StatusTable", { 
	setup: function(){
		S.open("//seccubus/finding/status_table/status_table.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Finding.StatusTable Demo","demo text");
});


});
