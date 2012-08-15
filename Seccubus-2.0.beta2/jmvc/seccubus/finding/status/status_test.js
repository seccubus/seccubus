steal('funcunit').then(function(){

module("Seccubus.Finding.Status", { 
	setup: function(){
		S.open("//seccubus/finding/status/status.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Finding.Status Demo","demo text");
});


});
