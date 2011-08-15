module("mxui/navigation test",{ 
	setup: function(){
        S.open("//mxui/navigation/navigation.html");
	}
})

test("Navigation Test", function(){
    
	S("#blocker").exists();
	S("#blocker").width( function(width) {
		ok(/0/.test(width), "Initial blocker width is correct.") 
	} );
	S("#blocker").width( function(height) {
		ok(/0/.test(height), "Initial blocker height is correct.") 
	} );
	
	S("#block").click()
	
	S("#blocker").waitOffset( function(offset) {
		return (offset.left == 0 && offset.top == 0)
	} );			
    S("#blocker").waitWidth( $(window).width() );
	S("#blocker").waitHeight( $(window).height() );
	S("#blocker").waitCss( "zIndex", function(zIndex) {
		return (zIndex == 9999)
	} );	

})