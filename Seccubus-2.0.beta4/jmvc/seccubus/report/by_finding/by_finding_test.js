steal('funcunit').then(function(){

module("Seccubus.Report.ByFinding", { 
	setup: function(){
		S.open("//seccubus/report/by_finding/by_finding.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Report.ByFinding Demo","demo text");
});


});