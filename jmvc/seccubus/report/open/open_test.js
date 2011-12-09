steal('funcunit').then(function(){

module("Seccubus.Report.Open", { 
	setup: function(){
		S.open("//seccubus/report/open/open.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Report.Open Demo","demo text");
});


});