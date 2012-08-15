steal('funcunit').then(function(){

module("Seccubus.Scan.Table", { 
	setup: function(){
		S.open("//seccubus/scan/table/table.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Scan.Table Demo","demo text");
});


});
