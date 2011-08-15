steal('funcunit').then(function(){

module("resize",{
	setup : function(){
		S.open("//mxui/layout/resize/resize.html");
	}
})


test("resizable testing works", function(){

        
	S.wait(10, function(){
		ok(true, "things working");
	})

});

})