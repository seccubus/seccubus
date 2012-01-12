steal('funcunit').then(function(){

module("Widgets.Modal", { 
	setup: function(){
		S.open("//widgets/modal/modal.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Widgets.Modal Demo","demo text");
});


});