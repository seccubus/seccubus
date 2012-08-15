steal('funcunit').then(function(){

module("Seccubus.Scan.List", { 
	setup: function(){
		S.open("//seccubus/scan/list/list.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Scan.List Demo","demo text");
});


});