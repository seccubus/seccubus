steal.plugins('funcunit').then(function(){

module("Clui.Grid", { 
	setup: function(){
		S.open("//clui/grid/grid.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Clui.Grid Demo","demo text");
});


});