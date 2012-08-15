steal('funcunit').then(function(){

module("Seccubus.History.Table", { 
	setup: function(){
		S.open("//seccubus/history/table/table.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.History.Table Demo","demo text");
});


});