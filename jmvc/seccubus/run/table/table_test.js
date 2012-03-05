steal('funcunit').then(function(){

module("Seccubus.Run.Table", { 
	setup: function(){
		S.open("//seccubus/run/table/table.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Run.Table Demo","demo text");
});


});