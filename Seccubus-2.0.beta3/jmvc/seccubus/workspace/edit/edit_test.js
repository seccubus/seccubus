steal('funcunit').then(function(){

module("Seccubus.Workspace.Edit", { 
	setup: function(){
		S.open("//seccubus/workspace/edit/edit.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Seccubus.Workspace.Edit Demo","demo text");
});


});