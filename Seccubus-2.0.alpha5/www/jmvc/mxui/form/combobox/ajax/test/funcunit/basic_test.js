module("ajax test", { 
	setup: function(){
        S.open("//mxui/combobox/ajax/ajax.html");
	}
})

test("Copy Test", function(){
	S("h1").text(function(val){
		equals(val, "Welcome to JavaScriptMVC 3.0!","welcome text");
	})
})