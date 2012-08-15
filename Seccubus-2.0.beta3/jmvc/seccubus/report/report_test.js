steal('funcunit').then(function(){

module("Seccubus.Report", { 
	setup: function(){
		S.open("//seccubus/report/report.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Report Demo","demo text");
});


});