steal.plugins('funcunit').then(function(){

module("Jupiter.Create", { 
	setup: function(){
		S.open("//jupiter/create/create.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Jupiter.Create Demo","demo text");
});


});