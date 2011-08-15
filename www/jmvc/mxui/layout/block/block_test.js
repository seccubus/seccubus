steal('funcunit').then(function(){

module("mxui/block test",{ 
	setup: function(){
        S.open("//mxui/layout/block/block.html");
		S("#blocker").exists();
	}
})

test("Block Test", function(){
    
	S("#blocker").exists(function(){
		ok(/0/.test(S("#blocker").width()), "Initial blocker width is correct.") 
		ok(/0/.test( S("#blocker").height() ), "Initial blocker height is correct.") 
	});

	S("#block").click()
	
	var winWidth, 
		winHeight;
	
	S("#blocker").offset( function(offset) {
		return (offset.left == 0 && offset.top == 0)
	} , function(){

		equals(S("#blocker").width(), S(S.window).width(),"width is correct")
		equals(S("#blocker").height(), S(S.window).height(),"height is correct")
		
		equals(S("#blocker").css( "zIndex"),  9999, "zIndex is high")
	});
	

});

});