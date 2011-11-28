steal('funcunit').then(function(){

module("Widgets.Datatable", { 
	setup: function(){
		S.open("//widgets/datatable/datatable.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Widgets.Datatable Demo","demo text");
});

});
