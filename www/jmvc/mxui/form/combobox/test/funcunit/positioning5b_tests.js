module("combobox4 test", { 
	setup: function(){
        S.open("//mxui/combobox/positioning5b.html");
	}
})

/*
 *  5. Combobox positioning tests - Combobox appended to positioned element:
 *  
 *  5a Tests that if the element can be positioned without scrolling below target, the dropdown opens bellow the target with full height.
 *  5b Tests that if the element can be positioned with scrolling greater than min height, the dropdown opens bellow with height equal the space available.
 *  5c Tests if the space above is greater than the space below and  dropdown doesnt fit in space above, the dropdown opens to fit space avaialble above 
 *  5d Tests if the space above is less than the space below and the dropdown doesnt fit the space available the dropdown opens bellow to fi the space avaialble
 */

/*
 *  5b Tests that if the element can be positioned with scrolling greater than min height, 
 *  the dropdown opens bellow with height equal the space available. 
 */
test("5b Tests that if the element can be positioned with scrolling greater than min height, the dropdown opens bellow with height equal the space available.", function() {
	
	S("#combobox5b").exists();
	
	S("#combobox5b").visible();	
	
	var comboOffset = S("#combobox5b").offset(),
		comboTop = comboOffset.top,
		comboBottom = comboTop + S("#combobox5b").outerHeight(),
		windowHeight = S(S.window).height();
		
	S("#combobox5b").find("input[type=text]").click();
	
	S("#combobox5b_dropdown").visible();	
			
	// make sure the dropdown position is right	
	S("#combobox5b_dropdown").offset( function(offset) {
		var dropTop = offset.top;
		return Math.abs(comboBottom - dropTop) < 1;
	});
	
	// make sure dropdown height fits space available bellow
	S("#combobox5b_dropdown").outerHeight( function(outerHeight) {
		return Math.abs(outerHeight - windowHeight + comboBottom) < 1;
	} );
	
});


