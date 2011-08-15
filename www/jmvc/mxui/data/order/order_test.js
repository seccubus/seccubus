steal('funcunit').then(function(){

module("Mxui.Data.Order", { 
	setup: function(){
		S.open("//mxui/data/order/order.html");
	}
});

test("Text Test", function(){
	equals(S("h1").text(), "Mxui.Data.Order Demo","demo text");
});


});