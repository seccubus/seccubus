module("select test", { 
	setup: function(){
        S.open("//mxui/combobox/select/select.html");
	}
})

test("Copy Test", function(){
	S("h1").text(function(val){
		equals(val, "Welcome to JavaScriptMVC 3.0!","welcome text");
	})
})